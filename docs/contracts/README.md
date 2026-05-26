# 一期闭环1：契约文档（Express + TypeScript）

本目录用于沉淀“一期闭环1（全员通知 + 测试账号）”的后端规范与接口契约，目标是让后端（角色B）、管理端（角色C）、学生端（角色D）在开始编码前就对齐：接口长什么样、错误怎么返回、代码结构怎么组织、权限校验放在哪一层。

适用范围：

- 一期只做“全员通知”，不做按年级/专业等人群规则。
- 一期先用测试账号/测试用户表，不接微信登录绑定。
- 后端技术栈：Express + TypeScript（先以规范替代框架复杂度）。

## 文档清单

- [API v1：通知闭环](./api-v1-notice.md)
- [错误码与返回规范](./errors.md)
- [后端目录结构与约定](./backend-structure.md)

## 关联说明

- 项目总体需求与模块范围：见 `docs/code-wiki/`（入口 [code-wiki/README.md](file:///workspace/docs/code-wiki/README.md)）

