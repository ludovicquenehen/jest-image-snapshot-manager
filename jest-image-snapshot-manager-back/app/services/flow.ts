import fs from 'node:fs'
import Project from '../models/project.js'
import Snapshot from '../models/snapshot.js'
import User from '../models/user.js'
import { exec } from 'node:child_process'
import util from 'node:util'
import Files from './files.js'

const runCommand = async (command: any) => {
  const execPromise = util.promisify(exec)
  try {
    return await execPromise(command as any)
  } catch (error) {
    return error
  }
}

export default class Flow {
  static async getVersionIteration(project: Project, version: string) {
    const sameVersionIteration = await Snapshot.query()
      .where('project_id', project.id)
      .andWhere('version', version)
      .orderBy('versionIteration', 'desc')
      .first()

    return (sameVersionIteration?.versionIteration || 0) + 1
  }

  static async commit(organization: string, projectId: number, version: string) {
    const snapshots = {
      MERGE: [] as string[],
      RECEIVED: [] as string[],
      DIFF: [] as string[],
    }

    const project = await Project.query().where('id', projectId).preload('devices').firstOrFail()
    try {
      project.commitInProgress = true
      await project.save()
      await runCommand(`cd ./../${project.path} && pnpm test`)
      project.commitInProgress = false
      await project.save()
    } catch (err) {
      project.commitInProgress = false
      await project.save()
      return err
    }

    fs.readdirSync(`./../${project.pathTests}/__image_snapshots__`, {
      withFileTypes: true,
    }).forEach(async (file) => {
      if (!file.isDirectory() && file.name.endsWith('.png')) {
        snapshots.MERGE.push(file.name)
      }
    })

    fs.readdirSync(`./../${project.pathTests}/__image_snapshots__/__received_output__`, {
      withFileTypes: true,
    }).forEach(async (file) => {
      if (file.name.endsWith('.png')) {
        snapshots.RECEIVED.push(file.name)
      }
    })

    const admin = await User.findOrFail(1)
    const versionIteration = await this.getVersionIteration(project, version)
    const suffixes = project.devices.map((e) => `__${e.suffix}__`, '')

    const newSnapshots: string[] = []
    await Promise.all(
      snapshots.MERGE.map(async (src) => {
        let label = src.replace('.png', '')
        let device = null
        suffixes.forEach((suffix) => {
          if (label.includes(suffix)) {
            device = suffix.replace(/__/g, '')
            label = label.replace(suffix, '')
          }
        })

        const findedTruth = await Snapshot.query()
          .where('organization', organization)
          .andWhere('label', label)
          .andWhere('truth', true)

        if (findedTruth.length > 0) {
          return null
        }
        newSnapshots.push(src)

        const snapshot = await Snapshot.create({
          organization,
          version,
          versionIteration,
          src,
          label,
          srcDiff: null,
          truth: true,
          projectId: project.id,
          validatorId: admin.id,
          status: 'MERGE',
          device,
        })

        return await snapshot.save()
      }).filter(Boolean)
    )

    await Promise.all(
      snapshots.RECEIVED.map(async (src) => {
        let label = src.replace('-received.png', '')
        let device: any = null
        suffixes.forEach((suffix) => {
          if (label.includes(suffix)) {
            device = suffix.replace(/__/g, '')
            label = label.replace(suffix, '')
          }
        })

        const findedTruths = await Snapshot.query()
          .where('organization', organization)
          .andWhere('label', label)
          .andWhere('truth', true)

        const findedTruth = findedTruths.find((e) => e.device === device)

        const srcDiff = src.replace('-received.png', '-diff.png')
        const snapshot = await Snapshot.create({
          organization,
          label,
          version,
          versionIteration,
          src,
          srcDiff,
          truthId: findedTruth?.id,
          truth: false,
          projectId: project.id,
          validatorId: admin.id,
          status: 'REQUEST',
          device,
        })
        return snapshot
      }).filter(Boolean)
    )
    await Files.tidy(organization, project, version, versionIteration, newSnapshots)
  }

  static async merge(
    organization: string,
    projectId: number,
    version: string,
    snapshotId: string | null = null
  ) {
    const project = await Project.findOrFail(projectId)
    const versionIteration = await this.getVersionIteration(project, version)

    const approved = await Snapshot.query()
      .where('organization', organization)
      .andWhere('status', 'APPROVE')
      .andWhere('version', version)
      .andWhere('project_id', project.id)
    const closed = await Snapshot.query()
      .where('organization', organization)
      .andWhere('status', 'DECLINE')
      .andWhere('version', version)
      .andWhere('project_id', project.id)

    await Promise.all([
      ...(approved as any)
        .filter((e: Snapshot) => !snapshotId || e.id === snapshotId)
        .map(async (e: any) => {
          const truth = await Snapshot.query()
            .where('organization', e.organization)
            .andWhere('label', e.label)
            .andWhere('device', e.device)
            .andWhere('truth', true)
            .andWhere('project_id', project.id)
            .firstOrFail()
          truth.truth = false
          await truth.save()

          let snapshot = await Snapshot.findOrFail(e.id)
          snapshot.status = 'MERGE'
          snapshot.truth = true
          await snapshot.save()

          Files.moveTruth(organization, project, version, versionIteration - 1, snapshot.src)
        }),
      ...(closed as any)
        .filter((e: Snapshot) => !snapshotId || e.id === snapshotId)
        .map(async (e: any) => {
          let snapshot = await Snapshot.findOrFail(e.id)
          snapshot.status = 'CLOSE'
          await snapshot.save()
        }),
    ])
  }
}
