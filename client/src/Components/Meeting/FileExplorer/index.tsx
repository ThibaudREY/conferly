import { Component, RefObject } from 'react';
import React                    from 'react';
import NavBar                   from './NavBar';
import File                     from './File';
import update                   from 'react-addons-update';
import Editor                   from 'react-simple-code-editor';
import Prism                    from 'prismjs';
import './index.css';

interface FileExplorerProps {
    dir: string
    className: string
    branches: string[]
    checkout: Function
    checkedOut: string
}

interface FileExplorerState {
    path: string
    files: any[]
    filesRef: RefObject<File>[]
    history: string[]
    historyIndex: number
    editor: boolean
    edited: string
    editedFormat: string
}

export default class FileExplorer extends Component<FileExplorerProps, FileExplorerState> {

    readonly state = {
        path: this.props.dir,
        files: new Array<any>(),
        filesRef: new Array<RefObject<File>>(),
        history: new Array<string>(this.props.dir),
        historyIndex: 0,
        editor: false,
        edited: '',
        editedFormat: ''
    };

    async componentDidMount() {
        this.setState({
            files: await this.files(this.state.path)
        })
    }

    private async files(path: string) {

        let files = [];

        // @ts-ignore
        const fileNames = await pfs.readdir(path);

        for (const fileName of fileNames) {
            // @ts-ignore
            const file = await pfs.stat(`${path}/${fileName}`);
            files.push({file, fileName});
        }
        return files;
    }

    private click() {
        this.state.filesRef.forEach(ref => {
            if (ref.current) {
                ref.current!.unselect();
            }
        })
    }

    private async navigate(e: React.MouseEvent<HTMLDivElement>, file: File) {
        this.setState({
            path: update(this.state.path, {$set: `${this.state.path}/${file.props.name}`}),
            files: await this.files(`${this.state.path}/${file.props.name}`),
            history: update(this.state.history, {$push: [`${this.state.path}/${file.props.name}`]}),
            historyIndex: this.state.historyIndex + 1
        });
    }

    private async show(e: React.MouseEvent<HTMLDivElement>, file: File) {

        // @ts-ignore
        const raw: ArrayBuffer = await pfs.readFile(`${this.state.path}/${file.props.name}`);
        const str: string = (new TextDecoder("utf-8")).decode(raw);

        const editedFormat: string = file.props.name.split('.').pop()!;

        this.setState({
            editor: true,
            edited: str,
            editedFormat
        })
    }

    private async up() {
        const levels = this.state.path.split('/');
        if (levels.length > 2) {
            this.setState({
                path: update(this.state.path, {$set: levels.slice(0, levels.length - 1).join('/')}),
                files: await this.files(levels.slice(0, levels.length - 1).join('/'))
            });
        }
    }

    private async back() {
        if (this.state.historyIndex > 0) {
            this.setState({
                historyIndex: this.state.historyIndex - 1,
                path: this.state.history[this.state.historyIndex - 1],
                files: await this.files(this.state.history[this.state.historyIndex - 1])
            });
        }
    }

    private async forward() {
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.setState({
                historyIndex: this.state.historyIndex + 1,
                path: this.state.history[this.state.historyIndex + 1],
                files: await this.files(this.state.history[this.state.historyIndex + 1])
            });
        }
    }

    private escape() {
        this.setState({
            edited: '',
            editor: false
        });
    }

    render() {

        const {className, branches, checkout, checkedOut} = this.props;
        const {path, files, filesRef, editor, edited, editedFormat} = this.state;

        return <div onClick={this.click.bind(this)} className={`file-explorer ${className}`}>

            <NavBar className='row' path={path}
                    up={this.up.bind(this)} back={this.back.bind(this)}
                    forward={this.forward.bind(this)}
                    editor={editor} escape={this.escape.bind(this)}/>

            {
                editor ? <div className='file-preview'>
                    <Editor
                        value={edited}
                        onValueChange={() => {
                        }}
                        highlight={(c: any) => {
                            let code = '';
                            try {
                                code = Prism.highlight(c, Prism.languages[editedFormat], editedFormat);
                            } catch (e) {
                                code = c;
                            }
                            return code;
                        }}
                        padding={10}
                        style={{direction: 'ltr'}}
                    />
                </div> : <div className='file-explorer-body'>
                    <div className="btn-group-vertical branches" role="group">
                        {
                            branches.map(branch => <button onClick={e => checkout(branch)} key={branch} type="button"
                                                           className={`btn ${checkedOut === branch ? 'btn-primary' : 'btn-secondary'} scroll-text`}><span>{branch}</span></button>)
                        }
                    </div>
                    <div className="file-explorer-files">
                        {
                            files.map((entry: any, index: number) => {
                                const ref = React.createRef<File>();
                                filesRef.push(ref);
                                return <File navigate={this.navigate.bind(this)} show={this.show.bind(this)}
                                             siblings={filesRef}
                                             ref={ref} isDirectory={entry.file.isDirectory()} name={entry.fileName}
                                             key={index}/>
                            })
                        }
                    </div>
                </div>
            }
        </div>
    }
}
