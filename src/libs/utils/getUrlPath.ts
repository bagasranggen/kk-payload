import slugify from 'slugify';

import { ArrayStringTypes } from '@/libs/types';
import { joinArrayString } from './joinArrayString';

import { FieldHookArgs, TypeWithID } from 'payload';

export type AdditionalPathArg = Pick<FieldHookArgs<TypeWithID, any, any>, 'siblingData' | 'req'>;

export type GetUrlPathProps = {
    withBaseUri?: boolean;
    withSlug?: (siblingData: AdditionalPathArg['siblingData']) => boolean;
    additionalPath?: (props: AdditionalPathArg) => Promise<string[]>;
} & AdditionalPathArg;

const BASE_URI = process.env.BASE_URI;

export const getUrlPath = async ({
    siblingData,
    req,
    additionalPath,
    withBaseUri = false,
    withSlug = () => true,
}: GetUrlPathProps): Promise<string | undefined> => {
    let data = undefined;

    let path = undefined;
    if (additionalPath) path = await additionalPath({ siblingData, req });

    let slug = undefined;
    if (siblingData?.title) slug = siblingData.title;
    if (siblingData?.slug) slug = siblingData.slug;
    if (slug) slug = slugify(slug, { lower: true });

    let url: ArrayStringTypes = [];
    if (BASE_URI && withBaseUri) url.push(BASE_URI);
    if (path) url.push(...path);
    if (withSlug(siblingData) && slug) url.push(slug);
    url = joinArrayString(url, '/');

    if (url) data = url;

    return data;
};
