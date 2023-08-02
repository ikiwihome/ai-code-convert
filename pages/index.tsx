import { CodeBlock } from '@/components/CodeBlock';
import { LanguageSelect, languages } from '@/components/LanguageSelect';
import { TextBlock } from '@/components/TextBlock';
import { TranslateBody } from '@/types/types';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [inputLanguage, setInputLanguage] = useState<string>('自然语言');
  const [outputLanguage, setOutputLanguage] = useState<string>('Python');
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);

  const handleTranslate = async () => {
    const maxCodeLength = 16000;

    if (inputLanguage === outputLanguage) {
      alert('请选择一个不同的编程语言.');
      return;
    }

    if (!inputCode) {
      alert('请输入一些代码.');
      return;
    }

    if (inputCode.length > maxCodeLength) {
      alert(
        `请输入不超过 ${maxCodeLength} 个字符，当前您已经输入了 ${inputCode.length} 个字符.`,
      );
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body: TranslateBody = {
      inputLanguage,
      outputLanguage,
      inputCode
    };

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert('OpenAI API KEY已经过期.');
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('发生了一些错误.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    setHasTranslated(true);
    copyToClipboard(code);
  };

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  useEffect(() => {
    const isOutputLanguageInArray = languages.some(
      (language) => language.value === outputLanguage
    );
    if (hasTranslated && isOutputLanguageInArray) {
      handleTranslate();
    }
  }, [outputLanguage]);

  return (
    <>
      <Head>
        <title>AI 代码生成工具</title>
        <meta name="description" content="使用AI将代码从一种语言转换成另一种语言." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="AI Code Converter,Code Convert AI, Code Generate AI,Code Translator,AICodeHelper,free,online" />
        <link rel="canonical" href="https://code.ikiwi.com" />
        <link rel="icon" href="/code.png" />
      </Head>

      <div className="h-100 flex justify-start items-center pl-10 pt-2 bg-[#0E1117]">
        <img className="w-50 h-50" alt="AICodeConverter" src="code.png" />
        <h1 className="text-white font-bold text-2xl"><span className="text-blue-500 ml-2">Code</span>.ikiwi.cc</h1>
      </div>

      <div className="flex h-full min-h-screen flex-col items-center bg-[#0E1117] px-4 pb-20 text-neutral-200 sm:px-10">
        <div className="mt-2 flex flex-col items-center justify-center sm:mt-10">
          <h2 className="text-4xl font-bold"><span className="text-blue-500">AI</span> 代码生成工具</h2>
          <div className="mt-5 text-xl text-center leading-2">翻译并解释一种 <span className="text-blue-500 font-bold">编程语言</span> 或者 <span className="text-blue-500 font-bold">自然语言</span> 到
            另一种 <span className="text-blue-500 font-bold">编程语言</span> 或者 <span className="text-blue-500 font-bold">自然语言</span></div>
        </div>

        <div className="mt-6 flex w-full max-w-[1200px] flex-col justify-between sm:flex-row sm:space-x-4">
          <div className="h-100 flex flex-col justify-center space-y-2 sm:w-2/4">
            <div className="text-center text-xl font-bold">原始输入</div>

            <LanguageSelect
              language={inputLanguage}
              onChange={(value) => {
                setInputLanguage(value);
                setHasTranslated(false);
                // setInputCode('');
                // setOutputCode('');
              }}
            />
            {inputLanguage === '自然语言' ? (
              <TextBlock
                text={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  setHasTranslated(false);
                }}
              />
            ) : (
              <CodeBlock
                code={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  setHasTranslated(false);
                }}
              />
            )}
          </div>
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="text-center text-xl font-bold">转换后的语言</div>

            <LanguageSelect
              language={outputLanguage}
              onChange={(value) => {
                setOutputLanguage(value);
                setOutputCode('');
              }}
            />

            {outputLanguage === '自然语言' ? (
              <TextBlock text={outputCode} />
            ) : (
              <CodeBlock code={outputCode} />
            )}
          </div>
        </div>

        <div className="mt-5 text-center text-sm">
          {loading
            ? '别着急，AI正在根据您的要求生成代码...'// Generating
            : hasTranslated
              ? '复制到剪贴板!'
              : '选择语言类型并输入自然语言文字或者代码，然后点击 "生成" 按钮'}
        </div>

        <div className="mt-5 flex items-center space-x-2">
          <button
            className="w-[140px] cursor-pointer rounded-md bg-blue-500 px-4 py-2 font-bold hover:bg-blue-600 active:bg-blue-700"
            onClick={() => handleTranslate()}
            disabled={loading}
          >
            {loading ? '生成中...' : '生成'}
          </button>
        </div>
      </div>
    </>
  );
}
