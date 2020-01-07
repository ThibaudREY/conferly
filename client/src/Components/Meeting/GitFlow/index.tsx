import React, { Component }                  from 'react';
import * as git                              from 'isomorphic-git';
import FileExplorer                          from '../FileExplorer';
import RotateLoader                          from 'react-spinners/RotateLoader';
import { FaFileCode, FaTimes }               from 'react-icons/all';
import { CommitOptions, Gitgraph }           from '@gitgraph/react';
import { CommitDescriptionWithOid }          from 'isomorphic-git';
import Draggable                             from 'react-draggable';
import { CommitDescriptionWithOidAndBranch } from '../../../Models/commit-description-with-oid-and-branch';
import { GitStates }                         from '../../../Enums/git-states.enum';
import { groupBy }                           from '../../../Utils/array';
import './index.css';

interface GitFlowProps {
    visible: boolean
    token: string | null
    provider: "github" | "bitbucket" | "gitlab" | undefined
}

interface GitFlowState {
    explorer: boolean
    branches: string[]
    checkedOut: string
    gitState: GitStates
    repoUrl: string
    gitgraph: any
}

export default class GitFlow extends Component<GitFlowProps, GitFlowState> {

    readonly state = {
        explorer: false,
        branches: new Array<string>(),
        checkedOut: '',
        gitState: GitStates.NO_URL,
        repoUrl: '',
        gitgraph: false
    };

    constructor(props: GitFlowProps) {
        super(props);

        (async () => {
            // @ts-ignore
            (window as any).fs = new LightningFS('fs', {wipe: true});
            git.plugins.set('fs', (window as any).fs);
            (window as any).pfs = (window as any).fs.promises;
            (window as any).dir = '/conferly';
            await (window as any).pfs.mkdir((window as any).dir);
            await (window as any).pfs.readdir((window as any).dir);
        })();
    }

    private async buildFlow() {
        if (!(await this.setup())) return;

        let tags: { [key: string]: { commit: any, branches: string[] } } = {};
        let branchLength: { [key: string]: number } = {};
        let graphBranches: { [key: string]: any } = {};
        let logs: CommitDescriptionWithOid[] = [];

        const renderMessage: CommitOptions["renderMessage"] = (commit) => {
            return (
                <text
                    y={commit.style.dot.size}
                    alignmentBaseline="central"
                    fill={commit.style.dot.color}
                >
                    <a rel="noopener noreferrer" target='_blank'
                       href={`${this.state.repoUrl}/commit/${commit.hash}`}>{commit.hashAbbrev} - {commit.subject}</a>
                </text>
            );
        };

        const render = (commit: CommitDescriptionWithOidAndBranch) => {
            return {
                renderMessage,
                subject: commit.message,
                hash: commit.oid
            } as any
        };

        if (git) {
            for (let branch of this.state.branches) {

                await this.checkout(branch);

                logs = logs.concat((await git.log({
                    dir: (window as any).dir,
                    ref: branch
                })).map((commit: any, index: number, array: CommitDescriptionWithOid[]) => {
                    branchLength[branch] = array.length;
                    tags[commit.oid] = {commit: null, branches: []};

                    commit['branch'] = branch;
                    return commit as CommitDescriptionWithOidAndBranch
                }));
            }


            const branchToFilter: string[] = [];
            const defaultBranch = Object.keys(branchLength).reduce((a, b) => branchLength[a] > branchLength[b] ? a : b);
            const willGraphBranches: { [key: string]: boolean } = {};
            graphBranches[defaultBranch] = (this.state.gitgraph as any).branch(defaultBranch);


            Object.values<CommitDescriptionWithOidAndBranch[]>(groupBy(logs, 'author.timestamp')).forEach((commits: CommitDescriptionWithOidAndBranch[]) => {
                if (commits.length === 1 && !willGraphBranches[commits[0].branch]) {
                    willGraphBranches[commits[0].branch] = true;
                    branchToFilter.push(commits[0].branch);
                }
            });


            Object.values<CommitDescriptionWithOidAndBranch[]>(groupBy(logs, 'author.timestamp')).forEach((commits: CommitDescriptionWithOidAndBranch[]) => {

                let commitMade: any;

                commits.forEach(commit => {
                    if (!graphBranches[commit.branch]) {
                        tags[commit.oid].branches.push(commit.branch)
                    }
                });

                if (commits.length === 1) {
                    if (!graphBranches[commits[0].branch]) {
                        graphBranches[commits[0].branch] = graphBranches[defaultBranch].branch(commits[0].branch);
                        commitMade = graphBranches[commits[0].branch].commit(render(commits[0]));
                    } else if (commits[0].parent.length === 1) {
                        commitMade = graphBranches[commits[0].branch].commit(render(commits[0]));
                    }
                } else {
                    commitMade = graphBranches[defaultBranch].commit(render(commits[0]));
                }

                if (commitMade) {
                    tags[commits[0].oid].commit = commitMade;
                    tags[commits[0].oid].branches.filter(branch => !branchToFilter.includes(branch)).forEach(branch => {
                        commitMade.tag(branch)
                    });
                }
            })
        }
    }

    private async setup(): Promise<any> {
        try {
            this.setState({
                gitState: GitStates.CLONING_REPO
            });
            await git.clone({
                oauth2format: this.props.provider,
                token: this.props.token || '',
                dir: (window as any).dir,
                corsProxy: process.env.REACT_APP_CORS_PROXY as string,
                url: this.state.repoUrl,
                singleBranch: false
            });

            this.setState({
                gitState: GitStates.FETCHING_BRANCHES,
                branches: (await git.listBranches({
                    dir: (window as any).dir,
                    remote: 'origin'
                })).filter((b: string) => b !== 'HEAD')
            });
        } catch (e) {
            this.setState({
                gitState: GitStates.ERROR
            });
            return;
        }

        this.setState({
            gitState: GitStates.DONE
        });

        return true;
    }

    private async checkout(branch: string) {
        this.setState({
            gitState: GitStates.CHECKING_OUT_BRANCH
        });
        await git.checkout({dir: (window as any).dir, ref: branch});
        this.setState({
            gitState: GitStates.DONE,
            checkedOut: branch
        });
    }

    private toggleExplorer() {
        this.setState({
            explorer: !this.state.explorer
        })
    }

    render() {

        const {visible} = this.props;
        const {explorer, checkedOut, gitState} = this.state;

        return <div className={`${!visible ? 'd-none' : ''}`}>

            <div className={`git-flow-loader ${gitState === GitStates.DONE ? 'd-none' : ''}`}>
                {
                    gitState === GitStates.ERROR ? <FaTimes size={50} color='#4A00E0'/> :
                        gitState === GitStates.NO_URL ?
                            <></> :
                            <RotateLoader color='#4A00E0' loading={true}/>
                }
                <h4 className="loading-title mt-4">
                    {gitState}
                </h4>
                {
                    gitState === GitStates.ERROR || gitState === GitStates.NO_URL ? <div>
                        <input type="text" className='form-control' value={this.state.repoUrl}
                               onChange={e => this.setState({repoUrl: e.target.value})}
                               onKeyDown={async e => e.key === 'Enter' ? await this.buildFlow() : null}/>
                        <button className="form-control" onClick={async () => await this.buildFlow()}
                                style={{color: '#4A00E0'}}>{gitState === GitStates.ERROR ? 'Retry' : 'Checkout'}</button>
                    </div> : null
                }
            </div>
            <div className={`row ${gitState !== GitStates.DONE ? 'd-none' : ''}`}>
                <div className={`git-flow ${explorer ? 'col-6' : 'col-12'}`}>

                    <div className='toggleExplorer' onClick={this.toggleExplorer.bind(this)}>
                        <FaFileCode/>
                    </div>

                    <Draggable>
                        <div className="draggable">
                            <Gitgraph>
                                {async (gitgraph) => {
                                    if (!this.state.gitgraph) {
                                        this.setState({
                                            gitgraph
                                        })
                                    }
                                }}
                            </Gitgraph>
                        </div>
                    </Draggable>
                </div>
                {
                    explorer ? <FileExplorer checkedOut={checkedOut} branches={this.state.branches}
                                             checkout={this.checkout.bind(this)} className='explorer col-6'
                                             dir={(window as any).dir}/> : null
                }
            </div>
        </div>
    }
}
