import { GitHub as GithubBacking } from '@actions/github/lib/utils'

import { RepositoryInfo } from './model'

type _Github = InstanceType<typeof GithubBacking>

/**
 * A lightweight wrapper around the Github API.
 *
 * @author Chachako
 */
export class Github {
  private api: _Github

  constructor(api: _Github) {
    this.api = api
  }

  async getUpstream(repo: RepositoryInfo): Promise<RepositoryInfo> {
    const response = await this.api.rest.repos.get({
      owner: repo.owner,
      repo: repo.name,
    })
    const upstream = response.data.parent

    if (response.data.fork && upstream) {
      return {
        owner: upstream.owner.login,
        name: upstream.name,
      }
    }

    throw new Error(
      `Input 'base' not specified and repository '${repo.owner}/${repo.name}'
       is not a forked repository.`,
    )
  }

  async getCloneUrl(repo: RepositoryInfo): Promise<string> {
    const response = await this.api.rest.repos.get({
      owner: repo.owner,
      repo: repo.name,
    })
    return response.data.clone_url
  }

  async listAllTags(repo: RepositoryInfo): Promise<string[]> {
    const tags = await this.api.paginate(this.api.rest.repos.listTags, {
      owner: repo.owner,
      repo: repo.name,
      per_page: 100,
    })
    return tags.map(tag => tag.name)
  }

  async listAllBranches(repo: RepositoryInfo): Promise<string[]> {
    const branches = await this.api.paginate(this.api.rest.repos.listBranches, {
      owner: repo.owner,
      repo: repo.name,
      per_page: 100,
    })
    return branches.map(branch => branch.name)
  }
}
