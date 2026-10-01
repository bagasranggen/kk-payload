import { FieldBase, Payload } from 'payload';

import { ArrayStringProps, ParametersProps } from '@/libs/types';
import { joinArrayString } from '@/libs/utils/joinArrayString';

export type GetMerchandiseVariantTitleProps = {
    payload?: Payload;
} & Partial<Pick<ParametersProps<NonNullable<NonNullable<FieldBase['hooks']>['beforeChange']>[number]>, 'siblingData'>>;

export const getMerchandiseVariantTitle = async ({ siblingData, payload }: GetMerchandiseVariantTitleProps) => {
    if (!payload) return;

    let data: ArrayStringProps = [];

    if (siblingData?.merchandise) {
        const merchandise = await payload.findByID({
            collection: 'merchandises',
            id: siblingData.merchandise,
        });

        if (merchandise?.title) data.push(merchandise.title);
    }

    if (siblingData?.size) {
        const size = await payload.findByID({
            collection: 'sizes',
            id: siblingData.size,
        });

        if (size?.title) data.push(size.title);
    }

    if (siblingData?.color) {
        const color = await payload.findByID({
            collection: 'colors',
            id: siblingData.color,
        });

        if (color?.title) data.push(color.title);
    }

    return joinArrayString(data, ' - ');
};
