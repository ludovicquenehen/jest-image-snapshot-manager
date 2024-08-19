import path from 'node:path'
import fs from 'node:fs'
import Project from '../models/project.js'
import env from '../../start/env.js'

export default class Files {
  static async createPath(filePath: string) {
    const dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
      return true
    }
    this.createPath(dirname)
    fs.mkdirSync(dirname)
  }

  static async copy(files: string[], srcDir: string, destDir: string) {
    files.forEach((file) => {
      const srcFile = path.join(srcDir, file)
      const destFile = path.join(destDir, file)
      fs.copyFile(srcFile, destFile, () => {})
    })
  }

  static async move(srcDir: string, destDir: string) {
    fs.readdir(srcDir, (err, files) => {
      if (err) throw err

      files.forEach((file) => {
        const srcFile = path.join(srcDir, file)
        const destFile = path.join(destDir, file)
        fs.rename(srcFile, destFile, () => {})
      })
    })
  }

  static async tidy(
    organization: string,
    project: Project,
    version: string,
    versionIteration: number,
    newSnapshot: string[]
  ) {
    const dirPath = `./public/snapshots/${organization}/${project.id}/${version}/${versionIteration}/.`
    this.createPath(dirPath)
    this.copy(newSnapshot, `./../${project.pathTests}/${env.get('SNAPSHOTS_DIR')}`, dirPath)
    this.move(`./../${project.pathTests}/${env.get('SNAPSHOTS_DIR')}/__received_output__`, dirPath)
    this.move(`./../${project.pathTests}/${env.get('SNAPSHOTS_DIR')}/__diff_output__`, dirPath)
  }

  static async moveTruth(
    organization: string,
    project: Project,
    version: string,
    versionIteration: number,
    src: string
  ) {
    const destPath = `./../${project.pathTests}/${env.get('SNAPSHOTS_DIR')}/${src.replace('-received', '')}`
    await fs.unlinkSync(destPath)
    await fs.copyFileSync(
      `./public/snapshots/${organization}/${project.id}/${version}/${versionIteration}/${src}`,
      destPath
    )
  }
}
