import { CollectionConfig, Option } from 'payload';
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
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionIncome', label: 'Income' }],
        url: {
            enabled: false,
        },
        general: {
            title: {
                admin: {
                    readOnly: true,
                },
                hooks: {
                    beforeChange: [
                        async ({ siblingData, req: { payload } }) => {
                            let data = '';

                            if (siblingData?.incomeType) {
                                const tmp = INCOME_TYPE_OPTIONS?.find((item) => item.value === siblingData.incomeType);

                                if (tmp?.label && typeof tmp.label === 'string') data = tmp.label;
                            }

                            try {
                                const related = await payload.findByID({
                                    collection: 'events',
                                    id: siblingData?.related,
                                });

                                if (related?.eventTitle) data += ` - ${related.eventTitle}`;
                            } catch (e) {}

                            return data;
                        },
                    ],
                },
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
                        name: 'related',
                        relationTo: 'events',
                        admin: {
                            condition: (data, siblingData) => siblingData?.incomeType === 'event',
                        },
                    },
                    {
                        type: 'number',
                        name: 'income',
                    },
                ],
            },
        ],
    }),
};
