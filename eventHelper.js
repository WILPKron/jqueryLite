class eventHelper {
    constructor(country = 'ru') {
        this.country = country;
        this.info = {
            mouse: {
                mouseenter: {
                    value: "mouseenter",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                mouseover: {
                    value: "mouseover",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                mousedown: {
                    value: "mousedown",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                mousemove: {
                    value: "mousemove",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                mouseup: {
                    value: "mouseup",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                click: {
                    value: "click",
                    description: {
                        ru: "Нажатие на левую кнопку мыши",
                        en: "left mouse botton",
                    }
                },
                auxclick: {
                    value: "auxclick",
                    description: {
                        ru: "Нажатие на другие кнопки мыши",
                        en: "eny mouse botton",
                    }
                },
                dblclick: {
                    value: "dblclick",
                    description: {
                        ru: "Двойное нажатие на левую кнопку мыши",
                        en: "left mouse double click",
                    }
                },
                wheel: {
                    value: "wheel",
                    description: {
                        ru: "Реагирование на кнопку скролла мыши",
                        en: "scroll bottom",
                    }
                },
            },
            element: {
                blur: {
                    value: "blur",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                focus: {
                    value: "focus",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                focusin: {
                    value: "focusin",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                focusout: {
                    value: "focusout",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                overflow: {
                    value: "overflow",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
            },
            input: {
                paste: {
                    value: "paste",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                input: {
                    value: "input",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
                change: {
                    value: "change",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
            },
            keyboard: {
                keydown: {
                    value: "keydown",
                    description: {
                        ru: "",
                        en: "",
                    }
                },
            }
        }
        this.eventList = this.list(this.info, {});
    }
    event (key) {
        return this.eventList[key].value;
    }
    description (key) {
        return this.eventList[key].description[this.country];
    }
    list(info, obj = {}) {
        for(let key in info) {
            let item = info[key];
            if('value' in item) {
                obj[key] = item;
            } else {
                this.list(item, obj);
            }
        }
        return obj;
    }
    infoPrint() {
        let obj = {};
        for(let key in this.eventList) {
            let item = this.eventList[key];
            let description = item.description[this.country];
            obj[item.value] = description ? description : 'empty' ;
        }
        console.table(obj);
    }
}

const wkEvent = new eventHelper();
// console.log(wkEvent.event('click'));
// console.log(wkEvent.description('click'));
// wkEvent.infoPrint();
