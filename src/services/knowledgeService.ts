import { pool } from '../db';

export class KnowledgeService {
    // 核心算法：提取学生问句特征，去金仓政策库里进行关键词密度与标签权重打分
    static async askQuestion(question: string) {
        // 1. 捞出库里所有政策
        const res = await pool.query('SELECT * FROM policy_knowledge');
        const policies = res.rows;

        let bestMatchPolicy = null;
        let highestScore = 0;

        // 排除掉没有检索价值的问句语气词
        const stopWords = ['怎么', '如何', '什么', '办理', '想要', '申请', '申领', '怎么办', '要等', '多久', '我想'];

        for (const policy of policies) {
            let score = 0;

            // 规则一：标题匹配度（如果问题直接包含了政策标题，权重极高）
            if (question.includes(policy.title) || policy.title.includes(question)) {
                score += 60;
            }

            // 规则二：标签碰撞（如果击中 policy.tags 里的关键词，额外加分）
            const tags = policy.tags ? policy.tags.split(',') : [];
            for (const tag of tags) {
                if (question.includes(tag)) {
                    score += 25;
                }
            }

            // 规则三：正文滑窗重合度匹配（滑动截取两个中文字符块，检索正文密度）
            for (let i = 0; i < question.length - 1; i++) {
                const chunk = question.substring(i, i + 2);
                if (!stopWords.includes(chunk) && policy.content.includes(chunk)) {
                    score += 3; // 每一个文字重合块加3分
                }
            }

            // 记录得分最高的政策
            if (score > highestScore) {
                highestScore = score;
                bestMatchPolicy = policy;
            }
        }

        // 2. 设定置信度红线：如果重合匹配得分太低（低于 8 分），说明牛头不对马嘴，触发兜底提示
        if (highestScore >= 8 && bestMatchPolicy) {
            return {
                match: true,
                score: highestScore,
                policyTitle: bestMatchPolicy.title,
                answer: `智能助理为您找到学院官方《${bestMatchPolicy.title}》的权威解答：\n\n${bestMatchPolicy.content}`
            };
        }

        return {
            match: false,
            score: 0,
            policyTitle: null,
            answer: "抱歉，知识库小助手未能找到完全匹配的学院政策。您可以尝试换个关键词提问，例如输入：“在读证明、入党步骤、团关系转接”。"
        };
    }
}