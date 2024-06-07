import env from '#start/env'
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

//PENDING: créer un projet avec les scenarios pour tous les projets OU séparer sur chaque projet
export default class Flow {
  static async getVersionIteration(project: Project, version: number) {
    const sameVersionIteration = await Snapshot.query()
      .where('project_id', project.id)
      .andWhere('version', version)
      .orderBy('versionIteration', 'desc')
      .limit(1)

    return (sameVersionIteration[0]?.versionIteration || 0) + 1
  }

  static async commit(projectId: string, version: number) {
    const snapshots = {
      MERGE: [] as string[],
      RECEIVED: [] as string[],
      DIFF: [] as string[],
    }

    const project = await Project.findOrFail(projectId)
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

    const newSnapshots: string[] = []
    await Promise.all(
      snapshots.MERGE.map(async (src) => {
        const label = src.replace('.png', '')

        const findedTruth = await Snapshot.query().where('label', label).andWhere('truth', true)

        if (findedTruth.length > 0) {
          return null
        }
        newSnapshots.push(src)

        //src = `${src.replace('.png', '')}-${version}-${versionIteration}.png`
        const snapshot = await Snapshot.create({
          version,
          versionIteration,
          src,
          label,
          srcDiff: null,
          truth: true,
          projectId: project.id,
          validatorId: admin.id,
        })

        snapshot.status = 'MERGE'
        return await snapshot.save()
      }).filter(Boolean)
    )

    await Promise.all(
      snapshots.RECEIVED.map(async (src) => {
        const label = src.replace('-received.png', '')
        const findedTruth = await Snapshot.query()
          .where('label', label)
          .andWhere('truth', true)
          .limit(1)

        const srcDiff = src.replace('-received.png', '-diff.png')
        const snapshot = await Snapshot.create({
          label,
          version,
          versionIteration,
          src,
          srcDiff,
          truthId: findedTruth[0]?.id,
          truth: false,
          projectId: project.id,
          validatorId: admin.id,
        })
        return snapshot
      }).filter(Boolean)
    )

    await Files.tidy(project, version, versionIteration, newSnapshots)
  }

  static async merge(projectId: string, version: number) {
    const project = await Project.findOrFail(projectId)
    const versionIteration = await this.getVersionIteration(project, version)

    const approved = await Snapshot.query()
      .where('status', 'APPROVE')
      .andWhere('version', version)
      .andWhere('project_id', project.id)
    const closed = await Snapshot.query()
      .where('status', 'DECLINE')
      .andWhere('version', version)
      .andWhere('project_id', project.id)

    await Promise.all([
      ...(approved as any).map(async (e: any) => {
        const truth = await Snapshot.query()
          .where('label', e.label)
          .where('truth', true)
          .andWhere('project_id', project.id)
        truth[0].truth = false
        await truth[0].save()

        let snapshot = await Snapshot.findOrFail(e.id)
        snapshot.status = 'MERGE'
        snapshot.truth = true
        await snapshot.save()

        Files.moveTruth(project, version, versionIteration - 1, snapshot.src)
      }),
      ...(closed as any).map(async (e: any) => {
        let snapshot = await Snapshot.findOrFail(e.id)
        snapshot.status = 'CLOSE'
        await snapshot.save()
      }),
    ])
  }
}
