import chalk from 'chalk';



export default function displayBanner() {

    console.log(chalk.cyan(`

 
██╗  ██╗ █████╗ ███████╗██╗   ██╗██╗  ██╗ █████╗ 
██║ ██╔╝██╔══██╗╚══███╔╝██║   ██║██║  ██║██╔══██╗
█████╔╝ ███████║  ███╔╝ ██║   ██║███████║███████║
██╔═██╗ ██╔══██║ ███╔╝  ██║   ██║██╔══██║██╔══██║
██║  ██╗██║  ██║███████╗╚██████╔╝██║  ██║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                                                 

                ${chalk.yellow('NODEGO AUTO - BOT BY KAZUHA ')}                

    📢  ${chalk.yellow('Telegram Channel: https://t.me/Im_Offical_Kazuha')}`));



    console.log(chalk.yellow('\n════════════════════════════════════════════════════════'));

    console.log(chalk.white(`Started at: ${new Date().toLocaleString()}`));

    console.log(chalk.yellow('════════════════════════════════════════════════════════\n'));

}
