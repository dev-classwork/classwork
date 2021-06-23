export const NotNullUser = {
    git_id: -1,
    id_auth: "",
    email: "Indefinido",
    password: "Indefinido",
}

export interface UserObject {
    git_id: number;
    id_auth: string;
    email: string;
    password: string;
}

export interface UserCredentials {
    email: string;
    password: string;
}

export interface Repos {
    commits_url: string;
    description: string;
    id: number;
    language: string;
    name: string;
    private: boolean;
    size: number;
}

export interface ActionInterface {
    title: string;
    description: string;
    shas: string[];
    commits: CommitInterface[];
    rank: {
        name: string;
        lines: number;
        additions: number;
        deletions: number;
        avatar: string;
        methods: number;
        complexity_cyclomatic: number;
        changes?: number;
    }[];
}

export interface CommitInterface {
    author: string;
    author_avatar: string;
    date: string;
    status: {
        total: number;
    };
    message: string;
    lines: number;
    tree:  any;
    files: any;
    complexity_cyclomatic: number;
    methods: number;
}

export interface Session {
    clear: Function;
    setItem: Function;
    getItem: Function;
}

export interface History {
    push: Function;
}

export interface Location {
    pathname: string;
    search: string;
}

export interface HeaderComponent {
    title?: string;
    headerBarTop?: boolean;
    primaryButtonColor?: string;
    secundaryButtonColor?: string;
}

export interface PainelComponent {
    haveBarTop?: boolean;
    color?: string;
    forceReturn?: string;
}

export interface DynamicColorElementComponent {
    children?: any;
    primaryColor: string;
    secundaryColor: string;
    type: string;
    selected?: boolean; 
    disable?: boolean;
    value?: number | string | string[] | undefined;
    name?: string;
    onCommitsChange?: (commitsLimit: number, commitsLimitIndex: number) => void;
    onChangeInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClickButton?: (e: any) => void;
}

export interface ClassworkMenu {
    id: number;
    session: string;
    route: string;
    icon: string;
    name: string;
    url: string;
}

export interface IconsComponent {
    color?: string;
    size?: number;
    name: string;
}

export interface CredentialsFormComponent {
    option: string;
    need_password: string;
    user: UserObject;
}

export interface DirectoryComponent {
    _url: string;
}

export interface DropzoneComponent {
    errors: string[],
    onFileUploaded: (file: File, template: {
        url: string,
        filename: string
    }, reset: boolean) => void;
    template: string;
    reset: boolean;
}

export interface ColorPickerComponent {
    onColorChange: (color: string, previewColor: string) => void;
    color: string;
}

export type TeamWithValues = {
    repos: string;
    points: number | string;
    porcent: number;
};

export interface TeamsAnalyticsComponent {
    primaryColor: string;
    secundaryColor: string;
    returnedValues: (teams: TeamWithValues[]) => void;
}

export interface TeamsAnalyticsDataItem {
    id?: number;
    name: string;
    repos: string;
    cc: number;
    mt: number;
    li: number;
    additions: number;
    deletions: number;
    changes?: number;
    commitInWeek?: boolean;
    details?: {
        author: string;
        additions: number;
        deletions: number;
        cc: number;
        mt: number;
        li: number;
    }[];
    balance: number;
    actions: ActionInterface;
    value: number;
}

export interface ConfirmBoxComponent{
    callbackFunction: Function | undefined;
    enable: boolean;
    primaryColor: string;
    secundaryColor: string;
    options: {
        title: string;
        returnValue: any;
    }[];
    title: string;
    description: string;
    index?: string | number;
    onChoose: (value: any, callbackFunction: Function | undefined, index?: string | number) => void;
}

export interface ConfirmBoxContent {
    callbackFunction: Function | undefined;
    title: string;
    description: string;
    index?: string | number;
    options: {
        title: string;
        returnValue: any;
    }[];
}

export interface ActiveShapeInterface {
    cx: number;
    cy: number;
    midAngle: number; 
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number; 
    payload: {
        name: string;
        avatar: string;
        total: number;
        additions: number;
        deletions: number;
        complexity_cyclomatic: number;
        lines: number;
        methods: number;
        changes: number;
    }
    percent: number; 
}

export interface TooltipInterface {
    active: boolean;
    label: string;
    payload: {
        value: string
    }[];
}

export interface TooltipTeamInterface {
    active: boolean;
    label: string;
    payload: {
        color: string;
        dataKey: string;
        fill: string;
        formatter: any;
        name: string;
        payload: {
            id: number;
            name: string;
            repos: string;
            changes: number;
            cc: number;
            mt: number;
            li: number;
            commitInWeek: boolean;
            balance: number;
            actions: ActionInterface
        }
        type: any;
        unit: string;
        value: number;
    }[];
}

export interface TreeItem {
    path: string;
    type: string;
    url: string;
}

export interface FileItem {
    filename: string;
    status: string;
    complexity_cyclomatic: number;
    lines: number;
    methods: number;
    additions: number;
    deletions: number;
    raw_url: string;
}

export interface TeamsItem {
    id?: number;
    name: string;
    repos: string;
    points?: number | string;
    porcent?: number;
}

export interface TeamsRankersItem {
    additions: number;
    deletions: number;
    name: string;
    total: number;
}

export interface ClassItem {
    name: string;
    description: string;
    key: string;
    image: string;
    avatar: string;
    color: string;
}

export interface ClassInfoItem {
    name: string;
    description: string;
    key: string;
    invite: string;
    teacher_id: number;
    image: string;
    color: string;
}

export interface ClassTeacherItem {
    git_id: number;
    id_auth: string;
    real_name: string;
    name: string;
    avatar: string;
}

export interface ClassMemberItem {
    avatar: string;
    git_id: number;
    name: string;
    real_name: string;
    urls: string[];
}

export interface TemplateItem {
    url: string, 
    filename: string
}