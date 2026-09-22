import { CollectionConfig, FieldHook, Option } from 'payload';
import { BaseEntry } from '@/shared';
import { ArrayStringProps, ParametersProps } from '@/libs/types';
import { joinArrayString } from '@/libs/utils';

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

export const getIncomeTitle = async ({ siblingData, req: { payload } }: ParametersProps<FieldHook>) => {
    let data: ArrayStringProps = [];

    if (siblingData?.incomeType) {
        const tmp = INCOME_TYPE_OPTIONS?.find((item) => item.value === siblingData.incomeType);

        if (tmp?.label && typeof tmp.label === 'string') data.push(tmp.label);
    }

    if (siblingData?.incomeDetail) data.push(siblingData.incomeDetail);

    if (siblingData?.incomeType === 'event' && siblingData?.event) {
        try {
            const event = await payload.findByID({
                collection: 'events',
                id: siblingData?.event,
            });

            if (event?.eventTitle) data.push(event.eventTitle);
        } catch (e) {
            console.log(e);
        }
    }

    if (siblingData?.date) {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        data.push(formatter.format(new Date(siblingData.date)));
    }

    return joinArrayString(data, ' - ');
};

export const Incomes: CollectionConfig = {
    slug: 'incomes',
    admin: {
        group: 'Cash Flow',
        useAsTitle: 'title',
    },
    hooks: {
        afterChange: [
            async ({ data, req }) => {
                req.context.triggeringRelatedUpdate = true;

                if (data?.event) {
                    try {
                        const totalIncome = await req.payload.find({
                            collection: 'incomes',
                            select: { income: true },
                            where: {
                                slug: { not_equals: data?.slug },
                                related: { equals: data?.event },
                            },
                        });

                        const updateIncome = totalIncome?.docs.reduce(
                            (accumulator, currentValue) => accumulator + (currentValue?.income ?? 0),
                            data?.income ?? 0
                        );

                        await req.payload.update({
                            collection: 'events',
                            id: data?.event,
                            data: {
                                totalIncome: updateIncome,
                            },
                            req, // CRITICAL: Keeps the operation inside the same database transaction
                        });
                    } catch {}
                }

                return data;
            },
        ],
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
                    beforeChange: [async (data) => await getIncomeTitle(data)],
                },
            },
        },
        sidebar: {
            slug: {
                admin: {
                    readOnly: true,
                },
                beforeChange: async (data) => await getIncomeTitle(data),
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
                        name: 'event',
                        relationTo: 'events',
                        admin: {
                            condition: (data, siblingData) => siblingData?.incomeType === 'event',
                        },
                    },
                    {
                        type: 'text',
                        name: 'incomeDetail',
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
