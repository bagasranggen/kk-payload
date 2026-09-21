import { Field, Tab } from 'payload';

import { BaseEntrySidebar, BaseEntrySidebarProps } from '@/shared/BaseEntrySidebar';
import { BaseEntryGeneral, BaseEntryGeneralProps } from '@/shared/BaseEntryGeneral';

export type BaseEntryProps = {
    tabs?: Tab[];
    url?: Omit<BaseEntryGeneralProps, 'fields' | 'title'>;
    general?: Pick<BaseEntryGeneralProps, 'fields' | 'title'>;
    sidebar?: Pick<BaseEntrySidebarProps, 'fields' | 'slug' | 'updateAt'>;
} & Pick<BaseEntrySidebarProps, 'typeHandle'>;

export const BaseEntry = ({ typeHandle, tabs: tabsProps, url = {}, general, sidebar }: BaseEntryProps): Field[] => {
    const tabs: Tab[] = [];
    tabs.push(BaseEntryGeneral({ ...url, fields: general?.fields, title: general?.title }));
    if (tabsProps && tabsProps.length > 0) tabs.push(...tabsProps);

    return [
        BaseEntrySidebar({
            typeHandle,
            fields: sidebar?.fields,
            slug: sidebar?.slug,
            updateAt: sidebar?.updateAt,
        }),
        {
            type: 'tabs',
            tabs,
        },
    ];
};
