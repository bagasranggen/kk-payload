import { CollectionConfig } from 'payload';
import { BaseEntry } from '@/shared';

export const Events: CollectionConfig = {
    slug: 'events',
    admin: {
        // group: 'Taxonomies',
        useAsTitle: 'eventTitle',
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionEvent', label: 'Event' }],
        url: { enabled: false },
        sidebar: {
            fields: [
                {
                    type: 'text',
                    name: 'eventTitle',
                    admin: {
                        hidden: true,
                        readOnly: true,
                    },
                    hooks: {
                        beforeChange: [
                            ({ siblingData }) => {
                                let data = '';

                                if (siblingData?.title) data = siblingData.title;
                                if (siblingData?.date) {
                                    const formatter = new Intl.DateTimeFormat('en-GB', {
                                        dateStyle: 'medium',
                                    });

                                    data += ` - ${formatter.format(new Date(siblingData.date))}`;
                                }

                                return data;
                            },
                        ],
                    },
                },
                {
                    type: 'select',
                    name: 'eventConfirmation',
                    defaultValue: 'confirmed',
                    required: true,
                    options: [
                        {
                            value: 'tbc',
                            label: 'To Be Confirmed',
                        },
                        {
                            value: 'confirmed',
                            label: 'Confirmed',
                        },
                    ],
                },
                {
                    type: 'select',
                    name: 'eventType',
                    options: [
                        {
                            value: 'internal',
                            label: 'Internal',
                        },
                        {
                            value: 'publicFree',
                            label: 'Public - Free',
                        },
                        {
                            value: 'publicTicketing',
                            label: 'Public - Ticketing',
                        },
                    ],
                },
            ],
            slug: {
                beforeChange: (siblingData) => {
                    let data = '';

                    let date = siblingData?.date ?? '';
                    let time = siblingData?.time ?? '';

                    if (date) {
                        const formatter = new Intl.DateTimeFormat('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        });

                        data = formatter.format(new Date(date));
                    }

                    if (time) {
                        const formatter = new Intl.DateTimeFormat('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false, // Use 24-hour clock
                        });

                        data += formatter.format(new Date(time)).replace(/:/g, '');
                    }

                    return data;
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
                                label: 'Event Date',
                                admin: {
                                    width: '25%',
                                    date: {
                                        pickerAppearance: 'dayOnly',
                                    },
                                },
                            },
                            {
                                type: 'date',
                                name: 'time',
                                label: 'Event Time',
                                admin: {
                                    width: '25%',
                                    date: {
                                        pickerAppearance: 'timeOnly',
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Incomes',
                fields: [
                    {
                        type: 'join',
                        name: 'income',
                        label: false,
                        collection: 'incomes',
                        on: 'related',
                        admin: {
                            defaultColumns: ['incomeType', 'title', 'income'],
                        },
                    },
                ],
            },
            {
                label: 'Expenses',
                fields: [
                    {
                        type: 'join',
                        name: 'expense',
                        label: false,
                        collection: 'expenses',
                        on: 'event',
                        admin: {
                            defaultColumns: ['expenseType', 'title', 'expense'],
                        },
                    },
                ],
            },
        ],
    }),
};
