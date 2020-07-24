import { AddUtilitiesOptionsObject, WrappedPlugin } from "@navith/tailwindcss-plugin-author-types";

export interface ThisPluginOptions {
	property?: string;
	rename?: string;
	addUtilitiesOptions?: Omit<AddUtilitiesOptionsObject, "variants">;
}

export type ThisPlugin = WrappedPlugin;
