import React from 'react';
import useForm from "react-hook-form";

interface FormData {
    username: String;
}

interface JoinModalFormProps {
    submit: any
}

const JoinModalForm: React.FC<JoinModalFormProps> = (props: JoinModalFormProps) => {

    const { register, handleSubmit, errors } = useForm<FormData>();

    return (
        <form onSubmit={handleSubmit(props.submit)}>
            <div className="form-group">
                <input name="username" ref={register({ required: true, minLength: 2, maxLength: 20 })} type="text" className="form-control form-input-username" placeholder="Username"></input>
                <div className="text-danger ml-2 ">
                    {errors.username && errors.username.type === 'required' && 'Username is required.'}
                    {errors.username && errors.username.type === 'minLength' && 'Username should at least be length 2.'}
                    {errors.username && errors.username.type === 'maxLength' && 'Username is 20 characters max length.'}
                </div>
            </div>
            <div className="text-center">
                <button className="btn btn-primary" type="submit">GO</button>
            </div>
        </form>
    );
};

export default JoinModalForm;
