import {ContentLayout, Layout, Text} from "@/components";
import React, {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";

type MarkdownPageProps = {
    markdownFilePath: string
}

function MarkdownPage({markdownFilePath}: MarkdownPageProps) {
    const [markdownText, setMarkdownText] = useState<string>('**markdown**');

    const fetchText = async () => {
        await fetch(markdownFilePath)
            .then(response => response.text())
            .then(text => setMarkdownText(text))
    }

    useEffect(() => {
        fetchText();
    }, [markdownFilePath]);

    return (
        <Layout>
            <ContentLayout>
                <div style={{color: 'white'}}>
                    <ReactMarkdown>
                        {markdownText}
                    </ReactMarkdown>
                </div>
            </ContentLayout>
        </Layout>
    );
}

export default MarkdownPage;
