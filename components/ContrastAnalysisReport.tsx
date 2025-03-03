import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { useContrastAnalyzer } from "@/features/contrast-analyzer"
import { ClipboardList, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

type AnalysisIssue = {
  element: string
  text: string
  foreground: string
  background: string
  ratio: number
  recommendation: string
}

export const ContrastAnalysisReport = () => {
  const { analyzeContrast, isAnalyzing, removeHighlights } =
    useContrastAnalyzer()
  const [report, setReport] = useState<{
    score: number
    issues: AnalysisIssue[]
  } | null>(null)

  const handleAnalyze = async () => {
    // Remove existing highlights when starting new analysis
    removeHighlights()
    const result = await analyzeContrast()
    if (result) {
      setReport(result)
    }
  }

  // Clean up highlights when component unmounts
  useEffect(() => {
    return () => {
      removeHighlights()
    }
  }, [removeHighlights])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Contrast Analysis Report
        </CardTitle>
        <CardDescription>
          Analyze website's contrast accessibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Website"
            )}
          </Button>

          {report && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Overall Score</div>
                <div className="text-2xl font-bold">
                  {(report.score * 100).toFixed(0)}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">
                  Issues Found ({report.issues.length})
                </div>
                <div className="space-y-2">
                  {report.issues.map((issue, index) => (
                    <div key={index} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: issue.foreground }}
                        />
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: issue.background }}
                        />
                        <span className="font-medium">{issue.element}</span>
                      </div>
                      <div className="mt-2 text-sm italic text-muted-foreground">
                        "{issue.text}"
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Contrast Ratio: {issue.ratio.toFixed(2)}:1
                      </div>
                      <div className="mt-2 text-xs">{issue.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
