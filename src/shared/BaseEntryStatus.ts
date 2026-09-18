import { Field, SelectField } from 'payload';

export type BaseEntryStatusProps = Pick<SelectField, 'admin'>;

export const BaseEntryStatus = (props?: BaseEntryStatusProps): Field => {
    return {
        type: 'select',
        name: 'entryStatus',
        label: 'Status',
        defaultValue: 'live',
        required: true,
        options: [
            {
                value: 'disabled',
                label: 'Disabled',
            },
            {
                value: 'live',
                label: 'Live',
            },
        ],
        ...(props?.admin ? { admin: props.admin } : {}),
    };
};
