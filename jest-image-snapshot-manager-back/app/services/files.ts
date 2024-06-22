import path from 'node:path'
import fs from 'node:fs'
import Project from '../models/project.js'

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
    version: number,
    versionIteration: number,
    newSnapshot: string[]
  ) {
    const dirPath = `./public/snapshots/${organization}/${project.id}/${version}/${versionIteration}/.`
    this.createPath(dirPath)
    this.copy(newSnapshot, `./../${project.pathTests}/__image_snapshots__`, dirPath)
    this.move(`./../${project.pathTests}/__image_snapshots__/__received_output__`, dirPath)
    this.move(`./../${project.pathTests}/__image_snapshots__/__diff_output__`, dirPath)
  }

  static async moveTruth(organization: string,project: Project, version: number, versionIteration: number, src: string) {
    const destPath = `./../${project.pathTests}/__image_snapshots__/${src.replace('-received', '')}`
    await fs.unlinkSync(destPath)
    await fs.copyFileSync(
      `./public/snapshots/${organization}/${project.id}/${version}/${versionIteration}/${src}`,
      destPath
    )
  }
}
