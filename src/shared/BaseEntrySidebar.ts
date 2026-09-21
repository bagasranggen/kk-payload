import { Field, Option, TextField } from 'payload';

import slugify from 'slugify';

import { BaseEntryStatus } from '@/shared/BaseEntryStatus';

export type TypeHandleOptionItem = Exclude<Option, string>;

export type BaseEntrySidebarProps = {
    typeHandle?: TypeHandleOptionItem[];
    fields?: Field[];
    updateAt?: {
        enabled?: boolean;
    };
    slug?: {
        beforeChange?: NonNullable<NonNullable<TextField['hooks']>['beforeChange']>[number];
    } & Pick<TextField, 'admin'>;
};

export const BaseEntrySidebar = ({
    typeHandle,
    fields: fieldsProps,
    slug: slugProps,
    updateAt,
}: BaseEntrySidebarProps): Field => {
    const fields: Field[] = [];

    if (updateAt?.enabled) {
        fields.push({
            type: 'text',
            name: 'updatedAt',
            admin: {
                readOnly: true,
            },
            hooks: {
                beforeChange: [
                    async () => {
                        return new Date().toISOString();
                    },
                ],
            },
        });
    }

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
                async (data) => {
                    let slug = undefined;
                    if (!data?.siblingData?.createdAt && data?.siblingData?.title && !data?.value) {
                        slug = data.siblingData.title;
                    }
                    if (!slug && data?.value) {
                        slug = data.value;
                    }
                    if (!slug && slugProps?.beforeChange && data) {
                        slug += slugProps.beforeChange(data);
                    }
                    if (slugProps?.admin?.readOnly && slugProps?.beforeChange && data) {
                        slug = await slugProps.beforeChange(data);
                    }

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
