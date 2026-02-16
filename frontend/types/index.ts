export interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    dueDate?: string;
    owner: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    fname: string;
    lname: string;
    email: string;
}
