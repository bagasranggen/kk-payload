import { CollectionConfig } from 'payload';

import { ParametersProps } from '@/libs/types';

export type GetUpdateCashFlowProps = {
    type?: 'expense' | 'income';
} & Pick<ParametersProps<NonNullable<NonNullable<CollectionConfig['hooks']>['afterChange']>[number]>, 'data' | 'req'>;

export const getUpdateCashFlow = async ({ type, data, req }: GetUpdateCashFlowProps) => {
    if (data?.event) {
        let updatedData = {};
        let tmp = 0;

        if (type === 'expense') {
            const totalExpense = await req.payload.find({
                collection: 'expenses',
                select: { expense: true },
                where: {
                    slug: { not_equals: data?.slug },
                    event: { equals: data?.event },
                },
            });

            tmp = totalExpense?.docs.reduce(
                (accumulator, currentValue) => accumulator + (currentValue?.expense ?? 0),
                data?.expense ?? 0
            );

            updatedData = Object.assign(updatedData, {
                totalExpense: tmp,
            });
        }

        if (type === 'income') {
            const totalIncome = await req.payload.find({
                collection: 'incomes',
                select: { income: true },
                where: {
                    slug: { not_equals: data?.slug },
                    event: { equals: data?.event },
                },
            });

            tmp = totalIncome?.docs.reduce(
                (accumulator, currentValue) => accumulator + (currentValue?.income ?? 0),
                data?.income ?? 0
            );

            updatedData = Object.assign(updatedData, {
                totalIncome: tmp,
            });
        }

        req.context.triggeringRelatedUpdate = true;

        await req.payload.update({
            collection: 'events',
            id: data?.event,
            data: updatedData,
            req, // CRITICAL: Keeps the operation inside the same database transaction
        });
    }
};
