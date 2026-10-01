import { CollectionConfig, Option } from 'payload';

import { CASH_FLOW_DISPLAY_FORMAT } from '@/libs/constansts';
import { convertIntToCurrency } from '@/libs/utils';
import { getIncomeTitle, getUpdateCashFlow, updateRelatedMerchandiseVariants } from '@/libs/factory';

import { BaseEntry } from '@/shared';

export const INCOME_TYPE_OPTIONS: Exclude<Option, string>[] = [
    {
        value: 'event',
        label: 'Event',
    },
    {
        value: 'merchandise',
        label: 'Merchandise',
    },
];

export const Incomes: CollectionConfig = {
    slug: 'incomes',
    admin: {
        group: 'Cash Flow',
        useAsTitle: 'title',
        defaultColumns: ['title', 'entryStatus', 'incomeType', 'date', 'event', 'incomeCurrency'],
    },
    hooks: {
        afterDelete: [
            async ({ doc, id, req }) => {
                await updateRelatedMerchandiseVariants({
                    payload: req?.payload,
                    req,
                    id: doc?.merchandise?.id,
                    diff: doc?.incomeQty,
                    action: 'increment',
                });
            },
        ],
        afterChange: [
            async ({ operation, data, previousDoc, req }) => {
                const id = data.merchandise;

                if (operation === 'create') {
                    await updateRelatedMerchandiseVariants({
                        payload: req?.payload,
                        req,
                        id,
                        diff: data?.incomeQty,
                        action: 'decrement',
                    });
                }

                if (operation === 'update') {
                    await updateRelatedMerchandiseVariants({
                        payload: req?.payload,
                        req,
                        id,
                        diff: Math.abs(previousDoc?.incomeQty - data?.incomeQty),
                        action: previousDoc?.incomeQty < data?.incomeQty ? 'decrement' : 'increment',
                    });
                }
            },
            async ({ data, req }) => {
                await getUpdateCashFlow({ type: 'income', data, req });
            },
        ],
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionIncome', label: 'Income' }],
        url: { enabled: false },
        general: {
            title: {
                admin: { readOnly: true },
                hooks: {
                    beforeChange: [async (data) => await getIncomeTitle({ data })],
                },
            },
        },
        sidebar: {
            slug: {
                admin: { readOnly: true },
                beforeChange: async (data) => await getIncomeTitle({ isSlug: true, data }),
            },
        },
        tabs: [
            {
                label: 'Detail',
                fields: [
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'date',
                                name: 'date',
                                defaultValue: new Date(),
                                admin: {
                                    width: '35%',
                                    date: {
                                        displayFormat: CASH_FLOW_DISPLAY_FORMAT,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        type: 'select',
                        name: 'incomeType',
                        label: 'Type',
                        options: INCOME_TYPE_OPTIONS,
                    },
                    {
                        type: 'relationship',
                        name: 'event',
                        relationTo: 'events',
                        admin: {
                            condition: (data, siblingData) => siblingData?.incomeType === 'event',
                        },
                    },
                    {
                        type: 'text',
                        name: 'incomeDetail',
                        admin: {
                            condition: (data, siblingData) => siblingData?.incomeType !== 'merchandise',
                        },
                    },
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'relationship',
                                name: 'merchandise',
                                relationTo: 'merchandiseVariants',
                                admin: {
                                    width: '90%',
                                    condition: (data, siblingData) => siblingData?.incomeType === 'merchandise',
                                },
                            },
                            {
                                type: 'number',
                                name: 'incomeQty',
                                label: 'Quantity',
                                defaultValue: 1,
                                admin: {
                                    width: '10%',
                                    condition: (data, siblingData) => siblingData?.incomeType === 'merchandise',
                                },
                            },
                        ],
                    },
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'number',
                                name: 'income',
                                admin: {
                                    width: '50%',
                                },
                                access: {
                                    update: ({ data }) => data?.incomeType !== 'merchandise',
                                },
                                hooks: {
                                    beforeChange: [
                                        async ({ siblingData, req: { payload } }) => {
                                            if (siblingData?.incomeType === 'merchandise' && siblingData?.merchandise) {
                                                let data = 0;

                                                const merchandise = await payload.findByID({
                                                    collection: 'merchandiseVariants',
                                                    id: siblingData.merchandise,
                                                });

                                                if (merchandise?.price) data = merchandise.price;

                                                if (siblingData?.incomeQty) data = data * siblingData.incomeQty;

                                                return data;
                                            }
                                        },
                                    ],
                                },
                            },
                            {
                                type: 'text',
                                name: 'incomeCurrency',
                                label: 'Income',
                                admin: {
                                    readOnly: true,
                                    width: '50%',
                                },
                                hooks: {
                                    beforeChange: [
                                        async ({ siblingData, req: { payload } }) => {
                                            if (siblingData?.incomeType === 'merchandise' && siblingData?.merchandise) {
                                                let data = 0;

                                                const merchandise = await payload.findByID({
                                                    collection: 'merchandiseVariants',
                                                    id: siblingData.merchandise,
                                                });

                                                if (merchandise?.price) data = merchandise.price;

                                                if (siblingData?.incomeQty) data = data * siblingData.incomeQty;

                                                return convertIntToCurrency(data);
                                            }
                                            return convertIntToCurrency(siblingData?.income);
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    }),
};
