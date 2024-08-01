export interface Subsection {
    title: string;
    content: string;
}

export interface Section {
    title: string;
    content: string;
    subsections?: Subsection[];
}

export interface Policy {
    id?: string;
    sections: Section[];
}
