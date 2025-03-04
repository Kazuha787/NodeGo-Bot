import fs from 'fs';

import axios from 'axios';

import { URL } from 'url';

import { SocksProxyAgent } from 'socks-proxy-agent';

import { HttpsProxyAgent } from 'https-proxy-agent';

import { HttpProxyAgent } from 'http-proxy-agent';

import chalk from 'chalk';

import displayBanner from './banner.js'; 



const userAgents = [

  'Chrome-Win10', 'Chrome-Mac', 'Firefox-Win',

  'Firefox-Mac', 'Chrome-Linux', 'Safari-iPhone', 'Edge-Win'

];



const getRandomUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];



class NodeGoPinger {

  constructor(token, proxyUrl = null) {

    this.apiBaseUrl = 'https://nodego.ai/api';

    this.bearerToken = token;

    this.agent = proxyUrl ? this.createProxyAgent(proxyUrl) : null;

    this.lastPingTimestamp = 0;

  }



  createProxyAgent(proxyUrl) {

    try {

      const parsedUrl = new URL(proxyUrl);



      if (proxyUrl.startsWith('socks4') || proxyUrl.startsWith('socks5')) {

        return new SocksProxyAgent(parsedUrl);

      } else if (proxyUrl.startsWith('http')) {

        return {

          httpAgent: new HttpProxyAgent(parsedUrl),

          httpsAgent: new HttpsProxyAgent(parsedUrl)

        };

      } else {

        const httpUrl = `http://${proxyUrl}`;

        const httpParsedUrl = new URL(httpUrl);

        return {

          httpAgent: new HttpProxyAgent(httpParsedUrl),

          httpsAgent: new HttpsProxyAgent(httpParsedUrl)

        };

      }

    } catch (error) {

      console.error(chalk.red('Invalid proxy URL:'), error.message);

      return null;

    }

  }



  async makeRequest(method, endpoint, data = null) {

    const config = {

      method,

      url: `${this.apiBaseUrl}${endpoint}`,

      headers: {

        'Authorization': `Bearer ${this.bearerToken}`,

        'Content-Type': 'application/json',

        'Accept': '*/*',

        'User-Agent': getRandomUA()

      },

      ...(data && { data }),

      timeout: 30000

    };



    if (this.agent) {

      if (this.agent.httpAgent) {

        config.httpAgent = this.agent.httpAgent;

        config.httpsAgent = this.agent.httpsAgent;

      } else {

        config.httpAgent = this.agent;

        config.httpsAgent = this.agent;

      }

    }



    try {

      return await axios(config);

    } catch (error) {

      throw error;

    }

  }



  async ping() {

    try {

      const currentTime = Date.now();



      if (currentTime - this.lastPingTimestamp < 3000) {

        await new Promise(resolve => setTimeout(resolve, 3000 - (currentTime - this.lastPingTimestamp)));

      }



      const response = await this.makeRequest('POST', '/user/nodes/ping', { type: 'extension' });



      this.lastPingTimestamp = Date.now();



      console.log(chalk.white(`🕒 [${new Date().toLocaleTimeString()}]`) + chalk.green(' ✓ PING'));

      console.log(chalk.white(`📡 Status: ${response.status}`));

      console.log(chalk.green(`💾 Data: ${JSON.stringify(response.data)}`));



      return response.data;

    } catch (error) {

      console.log(chalk.red(`✗ [ERR] ${error.message}`));

      throw error;

    }

  }

}



class MultiAccountPinger {

  constructor() {

    this.accounts = this.loadAccounts();

    this.isRunning = true;

  }



  loadAccounts() {

    try {

      const accountData = fs.readFileSync('data.txt', 'utf8')

        .split('\n')

        .filter(line => line.trim());



      const proxyData = fs.existsSync('proxies.txt')

        ? fs.readFileSync('proxies.txt', 'utf8')

          .split('\n')

          .filter(line => line.trim())

        : [];



      return accountData.map((token, index) => ({

        token: token.trim(),

        proxy: proxyData[index] || null

      }));

    } catch (error) {

      console.error(chalk.red('Error reading accounts:'), error);

      process.exit(1);

    }

  }



  async processPing(account) {

    const pinger = new NodeGoPinger(account.token, account.proxy);



    try {

      console.log(chalk.cyan(`\nPinging with token: ${account.token.slice(0, 10)}... (Proxy: ${account.proxy || 'None'})`));

      await pinger.ping();

    } catch (error) {

      console.error(chalk.red(`Error pinging account: ${error.message}`));

    }

  }



  randomDelay() {

    return Math.floor(Math.random() * 300000) + 300000; // 4-6 min delay

  }



  async runPinger() {

    displayBanner(); 



    process.on('SIGINT', () => {

      console.log(chalk.yellow('\nGracefully shutting down...'));

      this.isRunning = false;

      setTimeout(() => process.exit(0), 1000);

    });



    console.log(chalk.yellow('\n⚡ Starting ping cycle...'));

    while (this.isRunning) {

      console.log(chalk.white(`\n⏰ Ping Cycle at ${new Date().toLocaleString()}`));



      for (const account of this.accounts) {

        if (!this.isRunning) break;

        await this.processPing(account);

      }



      if (this.isRunning) {

        const delayMs = this.randomDelay();

        console.log(chalk.gray(`\nWaiting ${Math.round(delayMs/1000)} seconds before next cycle...`));

        await new Promise(resolve => setTimeout(resolve, delayMs));

      }

    }

  }

}



const multiPinger = new MultiAccountPinger();

multiPinger.runPinger();
