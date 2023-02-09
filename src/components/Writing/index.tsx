import {
  Box,
  Button,
  Heading,
  HStack,
  Select,
  Spinner,
  Text,
  Textarea,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

const topicTypes = ['IELTS Writing', 'IELTS Speaking', 'Debate'];

const generateButtons = [
  { name: 'Outline', promptType: 'outline', tooltip: 'Write an essay outline' },
  {
    name: 'Supportive arguments',
    promptType: 'support_arguments',
    tooltip: 'generate 3 arguments to support the statement',
  },
  {
    name: 'Opposite arguments',
    promptType: 'oppose_arguments',
    tooltip: 'generate 3 arguments to oppose the statement',
  },
  {
    name: 'Sample answer',
    promptType: 'sample_answer',
    tooltip: 'Write an sample essay',
  },
  {
    name: 'Introduction',
    promptType: 'introduction',
    tooltip: 'Write a short introduction paragraph for an essay',
  },
  {
    name: 'Conclusion',
    promptType: 'conclusion',
    tooltip: 'Write a short conclusion paragraph for this half-done essay',
    requireContent: true,
  },
  {
    name: 'Improve',
    promptType: 'improve',
    tooltip: 'Improve/Perfect this essay',
    requireContent: true,
  },
  {
    name: 'Suggestions',
    promptType: 'suggestions',
    tooltip:
      'What are the strengths & weaknesses of this essay? Give your suggestions for improvement for the writer',
    requireContent: true,
  },
];

const contentButtons = [
  {
    name: 'Elaborate',
    promptType: 'elaborate',
    tooltip: 'Elaborate/Explain the following argument in 3-4 sentences',
  },
  {
    name: 'Example',
    promptType: 'example',
    tooltip:
      'Give and explain an example in support of the following argument in 1-2 sentences',
  },
  {
    name: 'Finish sentence',
    promptType: 'finish_sentence',
    tooltip: 'Finish this sentence',
  },
  {
    name: 'Correct mistakes',
    promptType: 'correct_mistakes',
    tooltip:
      'Point out clearly the mistakes in this essay and how to correct them',
  },
  {
    name: 'Paraphrase',
    promptType: 'paraphrase',
    tooltip: 'Paraphrase/Rephrase this sentence/paragraph',
  },
  {
    name: 'Make longer',
    promptType: 'make_longer',
    tooltip: `Make this essay longer by elaborating on the existing points (don't add more arguments)`,
  },
  {
    name: 'Make simpler',
    promptType: 'make_simpler',
    tooltip: 'Rewrite this essay using simpler/more academic language',
  },
  {
    name: 'Summarize',
    promptType: 'summarize',
    tooltip: 'Summarize this essay',
  },
];

const vocabButtons = [
  {
    name: 'Dictionary',
    promptType: 'dictionary',
    tooltip:
      'Explain the meaning of the word and give me an example of how to use it in real life',
  },
  { name: 'Synonyms', promptType: 'synonyms', tooltip: 'Give me 5 synonyms' },
  { name: 'Antonyms', promptType: 'antonyms', tooltip: 'Give me 5 antonyms' },
  {
    name: 'Other ways to say',
    promptType: 'other_ways_to_say',
    tooltip: 'Give me 10 other ways to say this',
  },
];

const Writing = () => {
  const toast = useToast();

  const [topicType, setTopicType] = useState(topicTypes[0]);
  const [question, setQuestion] = useState('');
  const [content, setContent] = useState('');
  const [selectedContent, setSelectedContent] = useState('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [result, setResult] = useState({ title: '', content: '' });

  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const queryPrompt = async (promptType: string, content: string) => {
    setLoadingPrompt(true);
    const response = await fetch('/api/prompt', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topicType, promptType, question, content }),
    });
    const data = await response.json();
    // console.log(response, data);
    setLoadingPrompt(false);
    if (!response.ok) {
      toast({
        title: 'Error',
        description: data?.error?.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      return '';
    }
    return (data.result || '').trim();
  };

  const setSelectContent = () => {
    if (contentRef.current && selectedContent) {
      contentRef.current.focus();
      contentRef.current.setSelectionRange(
        contentRef.current.selectionStart,
        contentRef.current.selectionEnd
      );
    }
  };

  const renderButtons = (
    buttons: any[],
    color: string,
    content: string,
    isDisabled: boolean
  ) => {
    return (
      <HStack gap={1} wrap="wrap" alignItems="flex-start">
        {buttons.map((btn, i) => (
          <Tooltip key={i} hasArrow label={btn.tooltip}>
            <Button
              colorScheme={color}
              variant="outline"
              size="sm"
              isDisabled={
                !question || isDisabled || (btn.requireContent && !content)
              }
              onClick={async () => {
                setSelectContent();
                const resultContent = await queryPrompt(
                  btn.promptType,
                  content
                );
                if (resultContent) {
                  setResult({ title: btn.name, content: resultContent });
                }
              }}
            >
              {btn.name}
            </Button>
          </Tooltip>
        ))}
      </HStack>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {loadingPrompt && (
        <HStack
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Spinner size="lg" />
          <Text>Asking ChatGPT, please wait...</Text>
        </HStack>
      )}
      <VStack
        spacing={5}
        padding={5}
        style={loadingPrompt ? { filter: 'blur(.9px)' } : {}}
      >
        <VStack w={'100%'} spacing={2} alignItems="flex-start">
          <HStack alignItems="flex-start" w="100%" gap={2}>
            <Text>AI Type: </Text>
            <Select
              size={'sm'}
              w={40}
              value={topicType}
              onChange={(e) => setTopicType(e.target.value)}
            >
              {topicTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack alignItems="flex-start" w="100%" gap={2}>
            <Text>Question: </Text>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </HStack>
        </VStack>

        <HStack spacing={5} alignItems="flex-start" w="100%">
          <VStack w="100%">
            <Textarea
              ref={contentRef}
              rows={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onSelect={(e: any) => {
                // console.log(e);
                e.preventDefault();

                const { selectionStart, selectionEnd }: any = e.target;
                const selectedText = content.slice(
                  selectionStart,
                  selectionEnd
                );
                setSelectedContent(selectedText);
              }}
            />
          </VStack>
          <VStack alignItems="flex-start" w="100%">
            {renderButtons(generateButtons, 'blue', content, false)}
            <Text fontSize="sm">For selection text: </Text>
            {renderButtons(
              contentButtons,
              'teal',
              selectedContent,
              !selectedContent
            )}
            {renderButtons(
              vocabButtons,
              'cyan',
              selectedContent,
              !selectedContent
            )}

            {!!result.title && (
              <VStack alignItems="flex-start">
                <Heading size="md">{result.title}</Heading>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {result.content}
                </pre>
                <HStack>
                  <Button
                    size="sm"
                    onClick={() => {
                      setContent(result.content);
                    }}
                  >
                    Insert to editor
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </HStack>
      </VStack>
    </div>
  );
};

export default Writing;
