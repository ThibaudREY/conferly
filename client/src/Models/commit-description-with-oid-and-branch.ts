import { CommitDescriptionWithOid } from 'isomorphic-git';

export interface CommitDescriptionWithOidAndBranch extends CommitDescriptionWithOid {
    branch: string;
}
