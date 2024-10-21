import fs from "node:fs";
import path from "node:path";
import express from "express";
import { globSync } from "glob";
import mmmark, { type MmmarkUserSelectOptions } from "mm-mark";

namespace MarkPress {
	export interface MarkdownAppOptions {
		rootDir?: string;
		markOptions?: MmmarkUserSelectOptions;
	}
	export interface RenderPaths {
		getPath: string;
		renderPath: string;
	}
	export interface ConfigOptions {
		config?: {
			siteName?: string;
			meta?: Record<string, any>;
			cssLinks?: string[];
		};
	}
	// -----
	const mdContent = (tx: string) => mmmark.frontmatter(tx).content;
	const getHtml = (tx: string, options?: MmmarkUserSelectOptions): string => {
		const content = mdContent(tx);
		const converter = mmmark.Converter(options);
		return converter.makeHtml(content);
	};
	function createMdRoutes(dir: string, rootPath?: string) {
		const files = globSync(`${dir}/**/*.md`);
		const main_idx = files.find(
			(i) => path.basename(i) === "index.md" && path.dirname(i) === dir,
		);
		const midx = main_idx ? path.join(process.cwd(), main_idx) : "";
		const renderPaths: RenderPaths[] = [];
		files.map((i) => {
			const a = i.split("/").slice(1).join("/");
			const b = a.split(".")[0];
			const c = b.split("/");
			const fn = c.slice(-1)[0];
			let getPath = "";
			let renderPath = "";
			const root_path = rootPath ?? "/";
			if (c.length === 1 && fn === "index") {
				getPath = `${root_path}`;
				renderPath = fn;
			} else if (c.length === 1 && fn !== "index") {
				getPath = `${root_path}/${fn}`;
				renderPath = fn;
			} else if (c.length > 1 && fn === "index") {
				getPath = `${root_path}/${path.dirname(a)}`;
				renderPath = b;
			} else if (c.length > 1 && fn !== "index") {
				getPath = `${root_path}/${path.dirname(a)}/${fn}`;
				renderPath = b;
			}
			renderPaths.push({ getPath, renderPath });
		});
		return { midx, renderPaths };
	}

	function getMeta(filePath: string): string {
		const tx = fs.readFileSync(filePath, "utf8");
		const dat = mmmark.frontmatter(tx).data as ConfigOptions;
		const title = dat
			? `<title>${dat.config?.siteName}</title>`
			: "<title>MarkPress</title>";
		const meta_r = dat.config?.meta
			? Object.entries(dat.config.meta).map(
					([key, value]) =>
						`<meta name="${key}" content="${
							Array.isArray(value) ? value.join(",") : value
						}"/>`,
				)
			: [];
		const css_links = dat.config?.cssLinks
			? dat.config?.cssLinks.map(
					(i) => ` <link rel="stylesheet" href="${i}" />`,
				)
			: [];
		return [title, ...meta_r, ...css_links].join("\n");
	}
	//--------------------
	export function md(
		filePath: string,
		options: { dir?: string; markOptions?: MmmarkUserSelectOptions },
		callback: (e: any, rendered?: string) => void,
	) {
		fs.readFile(filePath, (err, content) => {
			if (err) return callback(err);
			const idx = options.dir ? createMdRoutes(options.dir).midx : undefined;
			const metaString = idx ? getMeta(idx) : undefined;
			const tx: string = content.toString("utf8");
			const html = getHtml(tx);
			const rendered = metaString ? `${metaString}\n${html}` : html;
			return callback(null, rendered);
		});
	}
	export function markApp(
		rootDir: string,
		rootPath?: string,
		options?: MmmarkUserSelectOptions,
	) {
		const renderObj = createMdRoutes(rootDir, rootPath).renderPaths;
		const app = express();
		app.engine("md", md);
		app.set("views", `${rootDir}`);
		app.set("view engine", "md");
		renderObj.map((i) =>
			app.get(i.getPath, (req, res) => {
				res.render(i.renderPath, { dir: rootDir, markOptions: options });
			}),
		);
		return app;
	}
	export function markMW(
		rootDir: string,
		rootPath?: string,
		options?: MmmarkUserSelectOptions,
	) {
		const renderObj = createMdRoutes(rootDir, rootPath).renderPaths;
		return (
			req: express.Request,
			res: express.Response,
			next: express.NextFunction,
		) => {
			req.app.engine("md", md);
			req.app.set("views", `${rootDir}`);
			req.app.set("view engine", "md");
			renderObj.map(({ getPath, renderPath }) =>
				req.app.get(getPath, (req, res) => {
					res.render(renderPath, { dir: rootDir, markOptions: options });
				}),
			);
			next();
		};
	}
}

export default MarkPress;
