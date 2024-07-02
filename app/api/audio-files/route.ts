import { Octokit } from '@octokit/rest';
import { NextResponse } from 'next/server';

export async function GET() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    const response = await octokit.repos.getContent({
      owner: 'mr-rony356',
      repo: 'Eric-Audio-button',
      path: 'embeded',
    });

    const files = (response.data as Array<any>).map(file => ({
      name: file.name,
      download_url: file.download_url,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ message: 'no audio availble'}, { status: 500 });
  }
}
