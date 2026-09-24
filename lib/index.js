/**
 * dsh-plugin-geo3d-modeling —— 地质三维建模与三维地震资料处理全流程 skill。
 *
 * 把 skills/geo3d-modeling/SKILL.md 作为 bundled skill 注册到 ctx.skills，
 * 模型在遇到地质建模/地震资料处理任务时可按需加载全流程指令。
 * 注册形态参照官方 dsh-ppt 的 bundled skill 模式
 * （@deepseek-ai/dsh-skill 的 BUNDLED_SKILL_RANK + ctx.skills.registerProvider）。
 */
import { BUNDLED_SKILL_RANK } from '@deepseek-ai/dsh-skill';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'dsh-plugin-geo3d-modeling';
export const inject = ['skills'];

/** 提供方唯一名（出现在 ctx.skills 注册表中）。 */
const PROVIDER = 'geo3d-modeling-bundled';
/** 稳定 skill 名（kebab-case，会出现在会话 skill 目录中）。 */
const SKILL_NAME = 'geo3d-modeling';
const DESCRIPTION =
  '地质三维建模与三维地震资料处理全流程：SEG-Y 数据体解析、层位/断层解释数据解析、CGCS2000 坐标统一（带带号）、原始数据分类整理、断层面建模、断层代表线与勘探范围 shp 输出、多矿区三维地质平台与汇报交付。';
const WHEN_TO_USE =
  '处理 SEG-Y 地震数据体、层位/断层解释文件（UDF/P701/FLT）、勘探范围边界、坐标系转换与带号恢复、生成带坐标系的标准 shp 成果、搭建三维地质展示平台或撰写领导汇报材料时。';
const INVOCATION = {
  modelInvocable: true,
  userInvocable: true,
};

function registerGeo3dModelingSkill(ctx) {
  const skillRoot = fileURLToPath(new URL('../skills/geo3d-modeling', import.meta.url));
  const skillPath = path.join(skillRoot, 'SKILL.md');
  const content = async () => readFile(skillPath, 'utf8');

  const candidate = {
    name: SKILL_NAME,
    description: DESCRIPTION,
    whenToUse: WHEN_TO_USE,
    invocation: INVOCATION,
    provider: PROVIDER,
    source: 'bundled',
    rank: BUNDLED_SKILL_RANK,
    locator: skillPath,
  };
  const provider = {
    name: PROVIDER,
    async list() {
      try {
        await content();
        return [candidate];
      } catch {
        return [];
      }
    },
    async get(selected) {
      if (selected?.name !== SKILL_NAME) return undefined;
      try {
        return {
          name: SKILL_NAME,
          description: DESCRIPTION,
          whenToUse: WHEN_TO_USE,
          invocation: INVOCATION,
          provider: PROVIDER,
          source: 'bundled',
          content: await content(),
        };
      } catch {
        return undefined;
      }
    },
  };
  ctx.skills.registerProvider(() => provider);
}

export function apply(ctx) {
  registerGeo3dModelingSkill(ctx);
}
