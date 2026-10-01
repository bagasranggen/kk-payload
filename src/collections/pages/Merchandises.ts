import { CollectionConfig } from 'payload';

import { BaseEntry } from '@/shared';
import { convertIntToCurrency } from '@/libs/utils';

export const Merchandises: CollectionConfig = {
    slug: 'merchandises',
    admin: {
        group: 'Pages',
        useAsTitle: 'title',
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionMerchandise', label: 'Merchandise' }],
        tabs: [
            {
                label: 'Media',
                fields: [],
            },
            {
                label: 'Detail',
                fields: [
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'number',
                                name: 'price',
                                admin: {
                                    width: '50%',
                                },
                            },
                            {
                                type: 'text',
                                name: 'priceCurrency',
                                admin: {
                                    width: '50%',
                                    readOnly: true,
                                },
                                hooks: {
                                    beforeChange: [
                                        ({ siblingData }) => {
                                            return convertIntToCurrency(siblingData?.price);
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Variants',
                fields: [
                    {
                        type: 'join',
                        name: 'variants',
                        label: false,
                        collection: 'merchandiseVariants',
                        on: 'merchandise',
                        orderable: true,
                        admin: {
                            defaultColumns: ['size', 'color', 'priceCurrency', 'stock'],
                        },
                    },
                ],
            },
            {
                label: 'Order History',
                fields: [
                    {
                        type: 'ui',
                        name: 'test',
                        admin: {
                            components: {
                                Field: 'src/components/fields/JoinOrderFields',
                            },
                        },
                    },
                ],
            },
        ],
    }),
};
