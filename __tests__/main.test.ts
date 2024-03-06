/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as github from '@actions/github'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
type Octokit = ReturnType<typeof github.getOctokit>

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  it('deletes the branch', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'github_token':
          return 'dummy_token'
        case 'repo_owner':
          return 'dummy_owner'
        case 'repo_name':
          return 'dummy_repo'
        case 'branch_name':
          return 'dummy_branch'
        default:
          return ''
      }
    })

    const deleteRefMock = jest.fn()
    const octokitMock = {
      rest: {
        git: {
          deleteRef: deleteRefMock
        }
      }
    } as unknown as Octokit
    jest.spyOn(github, 'getOctokit').mockReturnValue(octokitMock)

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      '==> Deleting branch "dummy_owner/dummy_repo/heads/dummy_branch"...'
    )
    expect(deleteRefMock).toHaveBeenCalledWith({
      owner: 'dummy_owner',
      repo: 'dummy_repo',
      ref: 'heads/dummy_branch'
    })
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('throws an error when deleting main branch', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'github_token':
          return 'dummy_token'
        case 'repo_owner':
          return 'dummy_owner'
        case 'repo_name':
          return 'dummy_repo'
        case 'branch_name':
          return 'main'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Cannot delete main branch'
    )
    expect(errorMock).not.toHaveBeenCalled()
  })
})
