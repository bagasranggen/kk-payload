import { CollectionConfig, Payload } from 'payload';

import { ParametersProps } from '@/libs/types';

export type UpdateRelatedMerchandiseVariantsProps = {
    payload?: Payload;
    id?: string;
    action?: 'decrement' | 'increment';
    diff?: number;
} & Partial<Pick<ParametersProps<NonNullable<NonNullable<CollectionConfig['hooks']>['afterChange']>[number]>, 'req'>>;

export const updateRelatedMerchandiseVariants = async ({
    payload,
    req,
    id,
    action,
    diff,
}: UpdateRelatedMerchandiseVariantsProps) => {
    if (!payload) return;
    if (!id) return;
    if (!diff || diff === 0) return;

    const relatedMerch = await payload.findByID({
        collection: 'merchandiseVariants',
        id,
    });

    const stock = relatedMerch?.stock ?? 0;

    let updatedData: { stock: number } | undefined = undefined;

    if (action === 'decrement') {
        updatedData = Object.assign(updatedData ?? {}, {
            stock: stock - diff,
        });
    }

    if (action === 'increment') {
        updatedData = Object.assign(updatedData ?? {}, {
            stock: stock + diff,
        });
    }

    if (updatedData && updatedData?.stock && updatedData.stock >= 0) {
        if (req) req.context.triggeringRelatedUpdate = true;

        await payload.update({
            collection: 'merchandiseVariants',
            id,
            data: updatedData,
            req, // CRITICAL: Keeps the operation inside the same database transaction
        });
    }
};
