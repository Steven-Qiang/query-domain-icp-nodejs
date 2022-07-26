/*
 * @file: typings.d.ts
 * @description: typings.d.ts
 * @package: miit
 * @create: 2022-07-11 01:29:08
 * @author: qiangmouren (2962051004@qq.com)
 * -----
 * @last-modified: 2022-07-26 12:49:57
 * -----
 */

export interface StructQueryList {
    contentTypeName: string;
    domain: string;
    domainId: number;
    leaderName: string;
    limitAccess: string;
    mainId: number;
    mainLicence: string;
    natureName: string;
    serviceId: number;
    serviceLicence: string;
    unitName: string;
    updateRecordTime: string;
}

export interface StructQueryRet {
    endRow: number;
    firstPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
    lastPage: number;
    list: StructQueryList[];
    navigatePages: number;
    navigatepageNums: number[];
    nextPage: number;
    orderBy: string;
    pageNum: number;
    pageSize: number;
    pages: number;
    prePage: number;
    size: number;
    startRow: number;
    total: number;
}