import { CollectionConfig } from 'payload';

import { convertIntToCurrency } from '@/libs/utils';

import { BaseEntry } from '@/shared';
import { getMerchandiseVariantTitle } from '@/libs/factory';

export const MerchandiseVariants: CollectionConfig = {
    slug: 'merchandiseVariants',
    labels: {
        singular: 'Variant',
        plural: 'Variants',
    },
    admin: {
        group: 'Merchandise',
        useAsTitle: 'title',
        defaultColumns: ['title', 'entryStatus', 'priceCurrency', 'size', 'color'],
        groupBy: true,
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionMerchandiseVariant', label: 'Merchandise Variant' }],
        url: { enabled: false },
        sidebar: {
            slug: {
                admin: { readOnly: true },
                beforeChange: async ({ siblingData, req: { payload } }) =>
                    await getMerchandiseVariantTitle({ payload, siblingData }),
            },
            fields: [
                {
                    type: 'number',
                    name: 'stock',
                },
            ],
        },
        general: {
            title: {
                admin: { readOnly: true },
                hooks: {
                    beforeChange: [
                        async ({ siblingData, req: { payload } }) =>
                            await getMerchandiseVariantTitle({ payload, siblingData }),
                    ],
                },
            },
        },
        tabs: [
            {
                label: 'Detail',
                fields: [
                    {
                        type: 'relationship',
                        name: 'merchandise',
                        relationTo: 'merchandises',
                    },
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'number',
                                name: 'price',
                                admin: {
                                    width: '50%',
                                },
                                hooks: {
                                    beforeChange: [
                                        async ({ siblingData, data, req: { payload } }) => {
                                            if (!data?.price && siblingData?.merchandise) {
                                                const merchandise = await payload.findByID({
                                                    collection: 'merchandiseVariants',
                                                    id: siblingData.merchandise,
                                                });

                                                const merch = merchandise?.merchandise;

                                                if (merch && typeof merch !== 'number' && merch?.price) {
                                                    return merch.price;
                                                }
                                            }
                                        },
                                    ],
                                },
                            },
                            {
                                type: 'text',
                                name: 'priceCurrency',
                                label: 'Price',
                                admin: {
                                    width: '50%',
                                },
                                hooks: {
                                    beforeChange: [
                                        async ({ siblingData, data, req: { payload } }) => {
                                            if (!data?.price && siblingData?.merchandise) {
                                                const merchandise = await payload.findByID({
                                                    collection: 'merchandiseVariants',
                                                    id: siblingData.merchandise,
                                                });

                                                const merch = merchandise?.merchandise;

                                                if (merch && typeof merch !== 'number' && merch?.price) {
                                                    return convertIntToCurrency(merch.price);
                                                }
                                            }

                                            if (data?.price) {
                                                return convertIntToCurrency(data?.price);
                                            }
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'relationship',
                                name: 'size',
                                relationTo: 'sizes',
                                admin: {
                                    width: '33.333%',
                                },
                            },
                            {
                                type: 'relationship',
                                name: 'color',
                                relationTo: 'colors',
                                admin: {
                                    width: '33.333%',
                                },
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Order',
                fields: [
                    {
                        type: 'join',
                        name: 'order',
                        collection: 'incomes',
                        on: 'merchandise',
                        admin: {
                            defaultColumns: ['date', 'title', 'incomeQty', 'incomeCurrency'],
                        },
                    },
                ],
            },
        ],
    }),
};
