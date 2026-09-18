import { Field, Option, TextField } from 'payload';

import slugify from 'slugify';

import { BaseEntryStatus } from '@/shared/BaseEntryStatus';

export type TypeHandleOptionItem = Exclude<Option, string>;

export type BaseEntrySidebarProps = {
    typeHandle?: TypeHandleOptionItem[];
    fields?: Field[];
    slug?: {
        beforeChange?: (siblingData?: any) => string;
    } & Pick<TextField, 'admin'>;
};

export const BaseEntrySidebar = ({
    typeHandle,
    fields: fieldsProps,
    slug: slugProps,
}: BaseEntrySidebarProps): Field => {
    const fields: Field[] = [];

    if (typeHandle && typeHandle.length > 0) {
        const isSingle = typeHandle.length === 1;

        fields.push({
            type: 'select',
            name: 'typeHandle',
            label: 'Type',
            options: typeHandle,
            defaultValue: isSingle ? typeHandle[0].value : undefined,
            required: true,
            admin: {
                readOnly: isSingle,
            },
        });
    }

    fields.push({
        type: 'text',
        name: 'slug',
        unique: true,
        required: true,
        admin: slugProps?.admin,
        hooks: {
            beforeChange: [
                ({ siblingData, value }) => {
                    let slug = undefined;
                    if (!siblingData?.createdAt && siblingData?.title && !value) slug = siblingData.title;
                    if (!slug && value) slug = value;
                    if (!slug && slugProps?.beforeChange) slug += slugProps.beforeChange(siblingData);

                    if (slug) return slugify(slug, { lower: true });
                },
            ],
        },
    });

    fields.push(BaseEntryStatus());

    if (fieldsProps && fieldsProps.length > 0) {
        fields.push(...fieldsProps);
    }

    return {
        type: 'group',
        admin: {
            position: 'sidebar',
        },
        fields,
    };
};
