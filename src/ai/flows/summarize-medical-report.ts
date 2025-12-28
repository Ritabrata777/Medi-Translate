// SummarizeMedicalReport flow translates medical jargon into simple, understandable language.
// It takes medical report text as input and returns a simplified summary.

'use server';

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { generatePdf, SimplifiedReport } from '@/services/pdf-generator';

const SummarizeMedicalReportInputSchema = z.object({
  reportText: z.string().describe('The text content of the medical report to be simplified.'),
  language: z.string().default('English').describe('The target language for the simplified report.'),
});
export type SummarizeMedicalReportInput = z.infer<typeof SummarizeMedicalReportInputSchema>;

const SummarizeMedicalReportOutputSchema = z.object({
  simplifiedReport: z.object({
    title: z.string().describe('The title of the simplified report.'),
    sections: z.array(
      z.object({
        heading: z.string().describe('The heading of the section.'),
        content: z.string().describe('The simplified content of the section.'),
      })
    ).describe('The sections of the simplified report.'),
  }).describe('The simplified medical report.'),
});
export type SummarizeMedicalReportOutput = z.infer<typeof SummarizeMedicalReportOutputSchema>;

export async function summarizeMedicalReport(
  input: SummarizeMedicalReportInput
): Promise<SummarizeMedicalReportOutput> {
  return summarizeMedicalReportFlow(input);
}

const summarizeMedicalReportPrompt = ai.definePrompt({
  name: 'summarizeMedicalReportPrompt',
  input: {
    schema: z.object({
      reportText: z.string().describe('The text content of the medical report to be simplified.'),
      language: z.string().describe('The target language for the report.'),
    }),
  },
  output: {
    schema: z.object({
      simplifiedReport: z.object({
        title: z.string().describe('The title of the simplified report.'),
        sections: z.array(
          z.object({
            heading: z.string().describe('The heading of the section.'),
            content: z.string().describe('The simplified content of the section.'),
          })
        ).describe('The sections of the simplified report.'),
      }).describe('The simplified medical report.'),
    }),
  },
  prompt: `You are a medical expert skilled at translating complex medical jargon into simple, understandable language for patients.
  
  Simplify the following medical report so that a layperson can easily understand it.
  Translate the simplified report into {{language}}.
  Organize the simplified report into sections with clear headings.

Medical Report:
{{{reportText}}}`,
});

const summarizeMedicalReportFlow = ai.defineFlow<
  typeof SummarizeMedicalReportInputSchema,
  typeof SummarizeMedicalReportOutputSchema
>({
  name: 'summarizeMedicalReportFlow',
  inputSchema: SummarizeMedicalReportInputSchema,
  outputSchema: SummarizeMedicalReportOutputSchema,
},
  async input => {
    try {
      const { output } = await summarizeMedicalReportPrompt(input);
      return output!;
    } catch (error) {
      console.error('AI Service Error (Possible Quota Exceeded), returning MOCK data:', error);
      return getMockDataForLanguage(input.language);
    }
  });

function getMockDataForLanguage(language: string = 'English'): SummarizeMedicalReportOutput {
  const mockContent: Record<string, any> = {
    'Spanish': {
      title: "Informe Médico Simplificado (MODO DEMO)",
      summary: "El servicio de IA no está disponible actualmente debido a límites de cuota. Este es un resumen de marcador de posición. Al paciente se le ha diagnosticado una afección estándar que requiere medicación y reposo.",
      findings: "1. La presión arterial está ligeramente elevada.\n2. No se encontraron signos de infección en el último análisis de sangre.\n3. El paciente reporta una mejora en los patrones de sueño.",
      nextSteps: "Haga un seguimiento con el médico general en 2 semanas. Continúe con el uso actual de medicamentos. Mantenga una dieta saludable."
    },
    'French': {
      title: "Rapport Médical Simplifié (MODE DÉMO)",
      summary: "Le service d'IA est actuellement indisponible en raison de limites de quota. Ceci est un résumé fictif. Le patient a été diagnostiqué avec une condition standard nécessitant des médicaments et du repos.",
      findings: "1. La tension artérielle est légèrement élevée.\n2. Aucun signe d'infection n'a été trouvé dans les dernières analyses sanguines.\n3. Le patient signale une amélioration du sommeil.",
      nextSteps: "Suivi avec le médecin généraliste dans 2 semaines. Continuez les médicaments actuels. Maintenez une alimentation saine."
    },
    'German': {
      title: "Vereinfachter medizinischer Bericht (DEMO-MODUS)",
      summary: "Der KI-Dienst ist derzeit aufgrund von Quotenbeschränkungen nicht verfügbar. Dies ist eine Platzhalter-Zusammenfassung. Beim Patienten wurde eine Standarderkrankung diagnostiziert, die Medikamente und Ruhe erfordert.",
      findings: "1. Der Blutdruck ist leicht erhöht.\n2. In den letzten Blutuntersuchungen wurden keine Anzeichen einer Infektion gefunden.\n3. Der Patient berichtet über verbesserte Schlafmuster.",
      nextSteps: "Nachuntersuchung beim Allgemeinarzt in 2 Wochen. Führen Sie die aktuelle Medikamenteneinnahme fort. Ernähren Sie sich gesund."
    },
    'Hindi': {
      title: "सरलीकृत चिकित्सा रिपोर्ट (डेमो मोड)",
      summary: "कोटा सीमाओं के कारण एआई सेवा वर्तमान में अनुपलब्ध है। यह एक डेमो सारांश है। रोगी को एक सामान्य स्थिति का निदान किया गया है जिसके लिए दवा और आराम की आवश्यकता है।",
      findings: "1. रक्तचाप थोड़ा बढ़ा हुआ है।\n2. नवीनतम रक्त जांच में संक्रमण का कोई संकेत नहीं मिला।\n3. रोगी ने नींद के पैटर्न में सुधार की सूचना दी है।",
      nextSteps: "2 सप्ताह में सामान्य चिकित्सक के साथ फॉलो-अप करें। वर्तमान दवा का उपयोग जारी रखें। स्वस्थ आहार बनाए रखें।"
    },
    'Chinese': {
      title: "简化医疗报告 (演示模式)",
      summary: "由于配额限制，AI 服务目前不可用。这是一个占位符摘要。患者被诊断患有需要药物治疗和休息的标准疾病。",
      findings: "1. 血压略有升高。\n2. 在最新的血液检查中未发现感染迹象。\n3. 患者报告睡眠模式有所改善。",
      nextSteps: "2 周后向全科医生复诊。继续当前药物使用。保持健康饮食。"
    },
    'Japanese': {
      title: "簡略化された医療レポート (デモモード)",
      summary: "クォータ制限のため、AI サービスは現在利用できません。これはプレースホルダーの要約です。患者は投薬と安静を必要とする標準的な状態と診断されました。",
      findings: "1. 血圧がわずかに上昇しています。\n2. 最新の血液検査では感染の兆候は見つかりませんでした。\n3. 患者は睡眠パターンの改善を報告しています。",
      nextSteps: "2 週間後に一般開業医の診察を受けてください。現在の薬の使用を続けてください。健康的な食事を維持してください。"
    },
    'Bengali': {
      title: "সরলীকৃত মেডিকেল রিপোর্ট (ডেমো মোড)",
      summary: "কোটা সীমার কারণে এআই পরিষেবা বর্তমানে অনুপলব্ধ। এটি একটি ডেমো সারাংশ। রোগীর একটি সাধারণ অবস্থা নির্ণয় করা হয়েছে যার জন্য ওষুধ এবং বিশ্রামের প্রয়োজন।",
      findings: "১. রক্তচাপ কিছুটা বেশি।\n২. সর্বশেষ রক্ত পরীক্ষায় সংক্রমণের কোনো লক্ষণ পাওয়া যায়নি।\n৩. রোগী ঘুমের ধরণ উন্নত হয়েছে বলে জানিয়েছেন।",
      nextSteps: "২ সপ্তাহের মধ্যে সাধারণ চিকিৎসকের সাথে ফলো-আপ করুন। বর্তমান ওষুধ ব্যবহার চালিয়ে যান। স্বাস্থ্যকর খাদ্য বজায় রাখুন।"
    },
    'English': {
      title: "Simplified Medical Report (DEMO MODE)",
      summary: "The AI service is currently unavailable due to quota limits. This is a placeholder summary. The patient has been diagnosed with a standard condition requiring medication and rest.",
      findings: "1. Blood pressure is slightly elevated.\n2. No signs of infection were found in the latest blood work.\n3. Patient reports improved sleep patterns.",
      nextSteps: "Follow up with the general practitioner in 2 weeks. Continue current medication usage. Maintain a healthy diet."
    }
  };

  const data = mockContent[language] || mockContent['English'];

  return {
    simplifiedReport: {
      title: data.title,
      sections: [
        {
          heading: "Summary",
          content: data.summary
        },
        {
          heading: "Key Findings",
          content: data.findings
        },
        {
          heading: "Next Steps",
          content: data.nextSteps
        }
      ]
    }
  };
}
