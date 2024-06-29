import { Octokit } from '@octokit/rest';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { filename, content } = await req.json();

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: 'mr-rony356',
      repo: 'Eric-Audio-button',
      path: `audio/${filename}`,
      message: `Upload ${filename}`,
      content: Buffer.from(content, 'base64').toString('base64'),
      committer: {
        name: 'mr-rony356',
        email: 'committer@example.com',
      },
      author: {
        name: 'mr-rony356',
        email: 'author@example.com',
      },
    });

    const link = `https://eric-audio-button.vercel.app/audio/${filename}`;
    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
