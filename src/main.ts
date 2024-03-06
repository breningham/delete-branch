import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const github_token: string = core.getInput('github_token')
    const repo_owner: string = core.getInput('repo_owner')
    const repo_name: string = core.getInput('repo_name')
    const branch_name: string = core.getInput('branch_name')

    const octokit = github.getOctokit(github_token)

    if (branch_name === 'main') {
      throw new Error('Cannot delete main branch')
    }

    core.debug(
      `==> Deleting branch "${repo_owner}/${repo_name}/heads/${branch_name}"...`
    )
    await octokit.rest.git.deleteRef({
      owner: repo_owner,
      repo: repo_name,
      ref: `heads/${branch_name}`
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
