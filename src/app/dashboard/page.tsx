'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePdf, SimplifiedReport } from '@/services/pdf-generator';
import { Download, Upload, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeMedicalReport } from '@/ai/flows/summarize-medical-report';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const placeholderReport = `
Patient Name: John Doe
Patient ID: 1234567
Date of Birth: 1960-01-01
Report Date: 2024-01-01

Medical Condition:
The patient presents with symptoms indicative of chronic obstructive pulmonary disease (COPD), including but not limited to persistent cough, dyspnea, and wheezing. Pulmonary function tests (PFTs) reveal a forced expiratory volume in one second (FEV1) of 60% predicted, confirming moderate COPD. Chest radiography illustrates hyperinflation and flattened diaphragms, consistent with emphysematous changes. Arterial blood gas (ABG) analysis demonstrates compensated respiratory acidosis with a PaCO2 of 48 mmHg and a PaO2 of 65 mmHg.

Recommendations:
1. Initiate bronchodilator therapy with a combination of long-acting beta-agonists (LABA) and inhaled corticosteroids (ICS).
2. Prescribe supplemental oxygen therapy to maintain oxygen saturation levels above 90%.
3. Enroll the patient in a pulmonary rehabilitation program to improve exercise tolerance and quality of life.
4. Advise smoking cessation and provide resources for smoking cessation support.
5. Administer influenza and pneumococcal vaccinations to reduce the risk of respiratory infections.
6. Monitor pulmonary function and arterial blood gases regularly to assess disease progression and treatment response.
`;

export default function Dashboard() {
    const [reportText, setReportText] = useState<string>(placeholderReport);
    const [simplifiedReport, setSimplifiedReport] = useState<SimplifiedReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [language, setLanguage] = useState<string>('English');
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = async () => {
                // Set the report text to the file content
                const fileContent = reader.result as string;
                setReportText(fileContent);
                setIsLoading(true);
                try {
                    const result = await summarizeMedicalReport({ reportText: fileContent, language });
                    // Inject language into the report object so PDF generator knows what font to use
                    setSimplifiedReport({
                        ...result.simplifiedReport,
                        language: language
                    });
                    toast({
                        title: 'Report simplified!',
                        description: `The medical report has been successfully simplified in ${language}.`,
                    });
                } catch (error: any) {
                    console.error('Error simplifying report:', error);
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: error.message || 'Failed to simplify the medical report.',
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            reader.readAsText(file);
        });
    }, [language]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'text/plain': ['.txt', '.pdf', '.docx'] } });

    const handleSummarize = async () => {
        setIsLoading(true);
        try {
            const result = await summarizeMedicalReport({ reportText: reportText, language });
            // Inject language into the report object so PDF generator knows what font to use
            setSimplifiedReport({
                ...result.simplifiedReport,
                language: language
            });
            toast({
                title: 'Report simplified!',
                description: `The medical report has been successfully simplified in ${language}.`,
            });
        } catch (error: any) {
            console.error('Error simplifying report:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to simplify the medical report.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!simplifiedReport) {
            toast({
                variant: 'destructive',
                title: 'No report to download',
                description: 'Please simplify a report before downloading.',
            });
            return;
        }

        try {
            const pdfBlob = await generatePdf(simplifiedReport);
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `simplified-report-${language}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: 'Download started',
                description: 'The simplified report is downloading as a PDF.',
            });
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to generate PDF.',
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-[#0a0a0a] text-white p-4 font-sans">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tight glow-text">
                MediTranslate Dashboard
            </h1>

            <Card className="w-full max-w-3xl mb-6 bg-white/5 border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader>
                    <CardTitle className="text-cyan-400">Upload Medical Report</CardTitle>
                    <CardDescription className="text-gray-400">
                        Drag and drop a file here, or click to select a file to upload.
                        <br />Supported formats: .txt, .pdf, .docx
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div {...getRootProps()} className="dropzone w-full p-8 border-2 border-dashed border-gray-700 hover:border-cyan-500 rounded-xl cursor-pointer bg-black/30 transition-all duration-300 flex flex-col items-center justify-center group/drop">
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center p-4 rounded-full bg-cyan-500/10 mb-4 group-hover/drop:bg-cyan-500/20 transition-colors">
                            <Upload className="h-8 w-8 text-cyan-400 group-hover/drop:scale-110 transition-transform" />
                        </div>
                        <p className="text-gray-400 group-hover/drop:text-cyan-300 transition-colors font-medium">Click or drag and drop to upload</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full max-w-3xl mb-6 bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-cyan-400">Input Data</CardTitle>
                            <CardDescription className="text-gray-400">Enter or paste the medical report text here.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-cyan-400" />
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[180px] bg-black/40 border-gray-700 text-gray-200 focus:ring-cyan-500">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-gray-700 text-gray-200">
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Spanish">Spanish (Español)</SelectItem>
                                    <SelectItem value="French">French (Français)</SelectItem>
                                    <SelectItem value="German">German (Deutsch)</SelectItem>
                                    <SelectItem value="Hindi">Hindi (हिंदी)</SelectItem>
                                    <SelectItem value="Chinese">Chinese (中文)</SelectItem>
                                    <SelectItem value="Japanese">Japanese (日本語)</SelectItem>
                                    <SelectItem value="Bengali">Bengali (বাংলা)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        className="w-full h-48 bg-black/40 border-gray-700 text-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none font-mono text-sm"
                        placeholder="Paste medical report text here..."
                    />
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleSummarize}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02]"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Processing...
                            </span>
                        ) : 'Simplify & Translate Report'}
                    </Button>
                </CardFooter>
            </Card>

            {simplifiedReport && (
                <Card className="w-full max-w-3xl mb-6 bg-white/5 border-white/10 backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <CardHeader>
                        <CardTitle className="text-cyan-400">Analysis Result ({language})</CardTitle>
                        <CardDescription className="text-gray-400">AI-Simplified Medical Summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {simplifiedReport.sections.map((section, index) => (
                            <div key={index} className="mb-6 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors">
                                <h2 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">{section.heading}</h2>
                                <p className="text-gray-300 leading-relaxed font-light">{section.content}</p>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleDownload} variant="secondary" className="bg-white/10 text-cyan-300 hover:bg-white/20 border-white/5">
                            Download PDF <Download className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {simplifiedReport === null && !isLoading && (
                <div className="w-full max-w-3xl flex justify-center">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="text-gray-500 hover:text-cyan-400 hover:bg-transparent">Load Example Data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#111] border-gray-800 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Load Example?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                    This will replace current text with a sample medical report.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-400 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => setReportText(placeholderReport)} className="bg-cyan-600 text-white hover:bg-cyan-500">Load</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    );
}
