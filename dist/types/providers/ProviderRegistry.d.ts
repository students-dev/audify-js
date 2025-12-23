import { IProvider } from '../interfaces';
export declare class ProviderRegistry {
    private providers;
    constructor();
    register(provider: IProvider): void;
    unregister(name: string): void;
    get(name: string): IProvider | undefined;
    getAll(): IProvider[];
    has(name: string): boolean;
}
