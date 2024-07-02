import { Octokit } from '@octokit/rest';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { filename, content } = await req.json();

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    // Upload the audio file
    const audioFilePath = `audio/${filename}`;
    await octokit.repos.createOrUpdateFileContents({
      owner: 'mr-rony356',
      repo: 'Eric-Audio-button',
      path: audioFilePath,
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

    // Create the HTML file with the audio player
    const htmlContent = generateHTML(filename);

    const htmlFilename = `${filename.split('.').slice(0, -1).join('.')}.html`;
    const htmlFilePath = `embeded/${htmlFilename}`;

    await octokit.repos.createOrUpdateFileContents({
      owner: 'mr-rony356',
      repo: 'Eric-Audio-button',
      path:htmlFilePath,
      message: `Create HTML for ${filename}`,
      content: Buffer.from(htmlContent).toString('base64'),
      committer: {
        name: 'mr-rony356',
        email: 'committer@example.com',
      },
      author: {
        name: 'mr-rony356',
        email: 'author@example.com',
      },
    });

    // Construct links for the uploaded files
    const audioLink = `https://eric-audio-button.vercel.app/${audioFilePath}`;
    const htmlLink = `https://eric-audio-button.vercel.app/${htmlFilePath}`;

    // Return links in the response
    return NextResponse.json({ audioLink, htmlLink });
  } catch (error) {
    // Handle errors and return an appropriate response
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

function generateHTML(filename: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Custom Audio Player</title>
        <!-- Plyr CSS -->
        <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
        <style>
        .audio-container {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          width: 100%;
          min-height: max-content;
          /* height: 350px; */
        }
        #plyr-audio {
          pointer-events: none;
        }
        .plyr--audio .plyr__controls {
          background: transparent !important;
        }
        .audio-player-container {
          display: flex;
          align-items: center;
          max-width: 100%;
          width: 100%;
          height: 100%;
          background-color: transparent;
          padding: 10px;
          border-radius: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .play-btn {
          cursor: pointer;
          width: 100%;
          height: 100%;
          background: none;
          border: none;
        }
        .play-btn img {
          width: 100%;
          height: 250px;
          object-fit: contain;
          margin-bottom: 15px;
        }
        .speed-btn {
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .speed-btn img {
          width: 32px;
          height: 32px;
          border-radius: 50px;
        }
        .audio-time {
          color: #888;
          font-weight: bold;
          text-align: center;
          font-size: 16px;
        }
        @media (max-width: 768px) {
          .audio-player-container {
            justify-content: center;
          }
          .play-btn img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
  
          .speed-btn {
            width: 35px;
            height: 35px;
          }
        }
        @media (max-width: 768px) {
          .play-btn,
          .speed-btn {
            margin-top: 5px;
          }
        }
      </style>
        </head>
      <body>
        <div class="audio-container">
          <div class="audio-player-container">
            <button class="play-btn" id="play-btn">
              <img id="play-img" src="../play.svg" alt="Play Button" />
            </button>
            <button class="speed-btn">
              <img src="../run.jpg" alt="" height="30px" />
            </button>
            <div id="plyr-audio" class="plyr">
              <audio id="audio-player" controls>
                <source src="https://eric-audio-button.vercel.app/audio/${filename}" type="audio/mp3" />
              </audio>
            </div>
            <div class="audio-time" id="audio-time">0:00</div>
          </div>
        </div>

        <!-- Plyr JavaScript -->
        <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
        <script>
          document.addEventListener("DOMContentLoaded", () => {
            const playButton = document.getElementById("play-btn");
            const playImg = document.getElementById("play-img");
            const speedButton = document.querySelector(".speed-btn");
            const audioTime = document.getElementById("audio-time");
            const audioElement = document.getElementById("audio-player");
            const plyrAudio = document.getElementById("plyr-audio");

            const player = new Plyr(audioElement, {
              controls: ["progress"],
              seekTime: 0,
              disableContextMenu: true,
            });

            const playImage = "../play.svg";
            const playImageGray = "../gray.svg"; // Replace with the actual path of the gray image

            plyrAudio.style.display = "block"; // Show the Plyr controls

            playButton.addEventListener("click", () => {
              if (player.playing) {
                player.pause();
                playImg.src = playImage;
              } else {
                player.play();
                playImg.src = playImageGray;
              }
            });

            speedButton.addEventListener("click", () => {
              const currentPlaybackRate = player.speed;
              if (currentPlaybackRate === 1) {
                player.speed = 1.5;
                speedButton.innerHTML = "<img src='../runs.jpg' alt='' height='30px'>";
              } else {
                player.speed = 1;
                speedButton.innerHTML = "<img src='../run.jpg' alt='' height='30px'>";
              }
            });

            player.on("timeupdate", updateTimer);

            function updateTimer() {
              const currentTime = player.currentTime;
              const duration = player.duration;
              const remainingTime = duration - currentTime;
              audioTime.textContent = \`\${formatTime(remainingTime)}\`;
            }

            function formatTime(seconds) {
              const minutes = Math.floor(seconds / 60);
              const secs = Math.floor(seconds % 60);
              return \`\${minutes}:\${secs < 10 ? "0" : ""}\${secs}\`;
            }
          });
        </script>
      </body>
    </html>
  `;
}
