//Imports
import { ensureDir } from "https://deno.land/std@0.95.0/fs/mod.ts"
import { loose } from "./constants.ts"

/** Reporting function */
export async function report(changes: loose[], { sha }: { sha: string }) {
  await ensureDir("patches")
  console.debug(`processing report: ${sha}`)
  let content = ""
  for (const change of changes) {
    content += `**[🗺️ Preview \`${change.map}\` changes online](https://gracidea.deno.dev?patch=${sha})**\n`
    content += "```diff\n"
    let changed = false
    for (const type of ["regions", "pins", "areas", "chunks"]) {
      if (change[type].created.length + change[type].edited.length + change[type].deleted.length > 0) {
        changed = true
        content += `@@ ${type} @@\n`
        if (change[type].created.length)
          content += `+ ${change[type].created.length} created\n  ${change[type].created.map(({ id = "", name = "" }) => `${name}#${id}`).join(", ")}\n`
        if (change[type].edited.length)
          content += `! ${change[type].edited.length} edited\n  ${change[type].edited.map(({ id = "", name = "" }) => `${name}#${id}`).join(", ")}\n`
        if (change[type].deleted.length)
          content += `- ${change[type].deleted.length} deleted\n  ${change[type].deleted.map(({ id = "", name = "" }) => `${name}#${id}`).join(", ")}\n`
        content += "\n"
      }
    }
    if (change.tiles.created + change.tiles.edited + change.tiles.deleted > 0) {
      changed = true
      content += `@@ tiles @@\n`
      if (change.tiles.created)
        content += `+ ${change.tiles.created} created\n`
      if (change.tiles.edited)
        content += `! ${change.tiles.edited} edited\n`
      if (change.tiles.deleted)
        content += `- ${change.tiles.deleted} deleted\n`
      content += "\n"
    }
    if (!changed)
      content += "# no changes\n"
    content = content.trimEnd() + "\n```\n"
  }
  console.debug(`saving: patches/${sha}.report`)
  await Deno.writeTextFile(`patches/${sha}.report`, content)
}
