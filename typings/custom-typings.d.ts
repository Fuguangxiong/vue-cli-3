declare module "simple-pinyin";
declare module "components";

declare module "*.svg" {
    const value: string;
    export default value;
}

declare module "*.json" {
    const value: any;
    export default value;
}

// declare module "*.less" {
//     const value: any;
//     export default value;
// }

interface RouteConfig {
    key: string;
    exact: boolean;
    strict: boolean;
    path: string;
    component: any;
    unrestricted: boolean;
}

declare module "*";
