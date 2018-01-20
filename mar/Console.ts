//todo pull this off the server or something?
let defaultText =
    " _______                    __     __\n" +
    "|   _   |.-----.---.-.----.|  |--.|__|.----.-----.----.-----.\n" +
    "|       ||  _  |  _  |  __||     ||  ||  __|  _  |   _|  _  |\n" +
    "|___|___||   __|___._|____||__|__||__||____|_____|__| |   __|\n" +
    "         |__|                                         |__|\n" +
    "\n" +
    "Version 1.3A, 1985-05-17\n" +
    "Initialising Universal Communication Port connection...Done\n" +
    "Current date is 2790-01-14\n" +
    "Cubot Status: Much Assembly Required";

enum ConsoleMode {
    CLEAR,
    NORMAL
}

interface ConsoleScreen {

    toggleColor(self: ConsoleScreen): void;

    toggleScrolling(self: ConsoleScreen): void;

    reset(self: ConsoleScreen): void;

    handleConsoleBufferUpdate(consoleBuffer: string[], mode: ConsoleMode): void;
}

class PlainTextConsoleMode {

    public width: number;
    public dialImage: string;


    constructor(lineWidth: number, dialImage: string) {
        this.width = lineWidth;
        this.dialImage = dialImage;
    }
}

class PlainTextConsole implements ConsoleScreen {

    private txtDiv: HTMLElement;
    private colorButton: HTMLImageElement;
    private scrollButton: HTMLImageElement;
    private resetButton: HTMLImageElement;
    private widthDial: HTMLImageElement;

    private colorToggled: boolean = false;
    public autoScroll: boolean = true;

    private modes: PlainTextConsoleMode[] = [];
    private mode: number;

    /**
     * Contents of the
     */
    private consoleText: string;

    /**
     * Length of the last line
     * @type {number}
     */
    private lastLineLength: number = 0;

    constructor(text: string, id: string, colorId: string, scrollId: string, resetID: string, dialId: string) {
        this.txtDiv = document.getElementById(id);
        this.colorButton = document.getElementById(colorId) as HTMLImageElement;
        this.scrollButton = document.getElementById(scrollId) as HTMLImageElement;
        this.resetButton = document.getElementById(resetID) as HTMLImageElement;
        this.widthDial = document.getElementById(dialId) as HTMLImageElement;

        let self = this;
        this.colorButton.onclick = function () {
            self.toggleColor(self)
        };
        this.scrollButton.onclick = function () {
            self.toggleScrolling(self)
        };
        this.resetButton.onclick = function () {
            self.reset(self);
        };
        this.widthDial.onclick = function () {
            PlainTextConsole.widthDialClick(self);
        };

        this.txtDiv.innerHTML = text;
        this.consoleText = text;

        //Line width modes. Might break if shorter than
        this.modes.push(new PlainTextConsoleMode(16, "./images/knob-170.png"));
        this.modes.push(new PlainTextConsoleMode(24, "./images/knob-123.png"));
        this.modes.push(new PlainTextConsoleMode(40, "./images/knob-90.png"));
        this.modes.push(new PlainTextConsoleMode(56, "./images/knob-65.png"));
        this.modes.push(new PlainTextConsoleMode(64, "./images/knob-10.png"));
        this.mode = 3; //Mode 56

    }

    /**
     * Toggle dark/light theme
     */
    public toggleColor(self: PlainTextConsole): void {

        if (self.colorToggled) {
            self.colorToggled = false;
            self.colorButton.src = "./images/pdp8ion.png";

            self.txtDiv.classList.remove("ctr-selection-inverted");
            self.txtDiv.classList.remove("ctr-text-inverted");
            self.txtDiv.classList.add("ctr-selection");
            self.txtDiv.classList.add("ctr-text");

        } else {
            self.colorToggled = true;
            self.colorButton.src = "./images/pdp8ioff.png";

            self.txtDiv.classList.add("ctr-selection-inverted");
            self.txtDiv.classList.add("ctr-text-inverted");
            self.txtDiv.classList.remove("ctr-selection");
            self.txtDiv.classList.remove("ctr-text");
        }
    }

    /**
     * Toggle auto scrolling. Also initially scrolls to bottom on click
     */
    public toggleScrolling(self: PlainTextConsole): void {

        if (self.autoScroll) {

            self.autoScroll = false;
            self.scrollButton.src = "./images/pdp8ion.png";

        } else {
            self.autoScroll = true;
            self.scrollButton.src = "./images/pdp8ioff.png";

            //Scroll to bottom
            self.txtDiv.scrollTop = self.txtDiv.scrollHeight;
        }

    }

    /**
     * Clears the console screen
     */
    public reset(self: PlainTextConsole): void {

        self.txtDiv.innerHTML = "";
        self.consoleText = "";
        self.lastLineLength = 0;

        self.resetButton.src = "./images/pdp8ioff.png";

        window.setTimeout(function () {
            self.resetButton.src = "./images/pdp8ion.png";
        }, 150);

    }

    /**
     * Update dial image and change console mode
     */
    private static widthDialClick(self: PlainTextConsole): void {
        if (self.mode < self.modes.length - 1) {
            self.mode++;
        } else {
            self.mode = 0;
        }

        //Update dial image
        self.widthDial.src = self.modes[self.mode].dialImage;
    }

    /**
     * Handles a consoleBuffer update
     * @param {string[]} consoleBuffer A Cubot's internal buffer, as an array of messages
     * @param {ConsoleMode} mode mode
     */
    handleConsoleBufferUpdate(consoleBuffer: string[], mode: ConsoleMode): void {

        //Reset console screen before writing to it (if requested by ComPort)
        if (mode == ConsoleMode.CLEAR) {
            this.reset(this);
        }

        //For each MESSAGE-LENGTH - length message
        for (let i = 0; i < consoleBuffer.length; i++) {

            //Zero-terminate the message
            let zeroIndex = consoleBuffer[i].indexOf("\0");
            let message = consoleBuffer[i].substring(0, zeroIndex == -1 ? undefined : zeroIndex);

            for (let j = 0; j < message.length; j++) {

                if (message[j] == "\n") {

                    this.consoleText += "\n";
                    this.lastLineLength = 0;

                } else {

                    if (this.lastLineLength < this.modes[this.mode].width) {
                        this.consoleText += message[j];
                        this.lastLineLength++;
                    } else {
                        this.consoleText += "\n";
                        this.consoleText += message[j];
                        this.lastLineLength = 1;
                    }
                }
            }
        }

        this.txtDiv.innerText = this.consoleText;

        //Scroll to bottom is autoScroll switch is flipped
        if (this.autoScroll) {
            this.txtDiv.scrollTop = this.txtDiv.scrollHeight;
        }

    }
}


