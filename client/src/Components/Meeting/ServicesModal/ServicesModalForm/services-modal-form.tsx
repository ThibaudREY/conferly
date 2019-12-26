import React from 'react';
import useForm from "react-hook-form";
import ToolBarItem from '../../../../Models/toolbar-item.model';

interface FormData {
    token: string;
    appKey: string;
}

interface ServicesModalFormProps {
    submit: any,
    item: ToolBarItem,
}

const ServicesModalForm: React.FC<ServicesModalFormProps> = (props: ServicesModalFormProps) => {

    const { register, handleSubmit, errors } = useForm<FormData>();

    const defaultValueToken = localStorage.getItem(props.item.name);

    return (
        <form className="form-inline" onSubmit={handleSubmit(props.submit)}>
            <div className="input-group flex-fill">
                <input name="token" ref={register({ minLength: 5 })} defaultValue={defaultValueToken!} type="text" className="form-control form-input-username" placeholder="Add token here"></input>
                <input name="appKey" ref={register} defaultValue={props.item.name} type="text" className="d-none"></input>
                <div className="text-danger ml-2 ">
                    {errors.token && errors.token.type === 'minLength' && 'Token should at least be length 5.'}
                </div>
                <div className="input-group-append">
                    <input type="submit" className="btn btn-primary" value="Save" />
                </div>
            </div>
        </form>
    );
};

export default ServicesModalForm;
