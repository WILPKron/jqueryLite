"use strict";
(() => {
    const createElementFromHTML = (htmlString) => {
        if(typeof htmlString !== 'string') return htmlString;
        let str = htmlString.replace(/\r?\n/g, '').replace(/\s+/g, ' ').trim();
        let div =  document.createElement('div');
        div.innerHTML = str;
        let arr = [].slice.call(div.children);
        return arr.length > 0 ? arr : htmlString;
    }
    const isDom = item => item.nodeType !== undefined && [3].indexOf(item.nodeType) === -1;
    const whatType = item => isDom(item) ? 'dom' : toString.call(item).replace('[', '').replace(']', '').split(' ')[1].toLowerCase();
    const readSelector = selector => {
        if(selector === undefined) return Array.from([]);
        let elements = [];
        let selectorTemp = createElementFromHTML(selector);
        let type = whatType(selectorTemp);
        if(type === 'array') selector = selectorTemp;

        switch (type) {
            case 'dom':
                elements = [selector];
            break;
            case 'text':
            case 'string':
                elements = document.querySelectorAll(selector);
            break;
            case 'nodelist':
            case 'array':
                elements = selector;
            break;
            case 'object':
                elements = (type === 'object' && selector.elements !== undefined) ? selector.elements : [];
            break;
        }
        return Array.from(elements);
    }
    const eventTrigger = (element, eventName) => {
        const event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, true, false);
        element.dispatchEvent(event);
    }

    const cloneElements = element => {
        const cloneElement = [];
        element.each( item =>  cloneElement.push(item.cloneNode(true)) );
        return cloneElement;
    }

    const serialize = (form, arrayMode = false) => {
        let arr = [];
        Array.prototype.slice.call(form.elements).forEach( (field) => {
            if (!field.name || field.disabled || ['file', 'reset', 'submit', 'button'].indexOf(field.type) > -1) return;
            if (field.type === 'select-multiple') {
                Array.prototype.slice.call(field.options).forEach( (option) => {
                    if (!option.selected) return;
                    arrayMode
                    if(arrayMode) {
                        arr[field.name] = arr[field.name] ?? [];
                        arr[field.name].push(option.value);
                    } else {
                        arr.push(`${encodeURIComponent(field.name)}=${encodeURIComponent(option.value)}`);
                    }
                });
                return;
            }
            if (['checkbox', 'radio'].indexOf(field.type) >-1 && !field.checked) return;
            if(arrayMode) {
                arr[field.name] = arr[field.name] ?? [];
                arr[field.name].push(field.value);
            } else {
                arr.push(`${encodeURIComponent(field.name)}=${encodeURIComponent(field.value)}`);
            }
        });
        return arrayMode ? arr : arr.join('&');
    }

    function wk (selector) {
        const elements = readSelector(selector);

        return {
            elements,
            selector,
            each (callback) {
                elements.forEach(element => callback( element ));
            },
            first (returnVanilla = true) {
                return returnVanilla ? elements[0] : wk(elements[0]);
            },
            remove () {
                this.first().parentNode.removeChild(this.first());
                return this;
            },
            html (newHtml) {
                if(newHtml !== undefined) {
                    this.each(element => element.innerHTML = newHtml);
                } else return this.first().innerHTML;
                return this;
            },
            css (newCss) {
                this.each(element => Object.assign(element.style, newCss));
                return this;
            },
            hiden () {
                this.each(element => element.style.display = 'none');
                return this;
            },
            show () {
                this.each(element => element.style.removeProperty('display'));
                return this;
            },
            toggle () {
                this.each(element => {
                    if(element.style.display === 'none') {
                        element.style.removeProperty('display');
                    } else {
                        element.style.display = 'none';
                    }
                });
                return this;
            },
            addClass (className) {
                this.each(element => element.classList.add(className));
                return this;
            },
            removeClass (className) {
                this.each(element => element.classList.remove(className));
                return this;
            },
            toggleClass (className) {
                this.each(element => element.classList.toggle(className));
                return this;
            },
            hasClass (className) {
                return this.first().classList.contains(className);
            },
            trigger (eventName) {
                this.each(element => eventTrigger(element, eventName));
                return this;
            },
            parent (eventName) {
                return this.first().parentNode;
            },
            parents (selector) {
                return this.first().closest(selector);
            },
            find (selector) {
                return wk(this.first().querySelectorAll(selector));
            },
            children () {
                return this.first().children;
            },
            contains (element, child) {
                return element !== child && element.contains(child);
            },
            clone (element) {
                return this.first().cloneNode(true);
            },
            after (element) { // not use
                const cloneElement = cloneElements(wk(element));
                this.each( el => {
                    cloneElement.forEach( item => el.insertAdjacentElement('afterend', item.cloneNode(true)));
                })
                return this;
            },
            before (element) { // not use
                const cloneElement = cloneElements(wk(element));
                this.each( el => {
                    cloneElement.forEach( item => el.insertAdjacentElement('beforebegin', item.cloneNode(true)) );
                });
                return this;
            },
            append (element) {
                const cloneElement = cloneElements(wk(element));
                this.each( el => {
                    cloneElement.forEach( item => el.appendChild(item.cloneNode(true)) );
                });
                return this;
            },
            detach () {
                const cloneElement = cloneElements(this);
                this.each( item => item.parentNode.removeChild(item));
                return cloneElement;
            },
            data (key,value) {
                if(key !== undefined) {
                    if (typeof key === 'string' && value !== undefined) {
                        key = {key, value};
                        value = undefined;
                    }
                    if (typeof key === 'string' && value === undefined) {
                        return this.first().dataset[key];
                    } else if(typeof key === 'object' && value === undefined) {
                        this.each(element => Object.assign(element.dataset, key));
                    }
                }
                return this;
            },
            removeData (key) {
                this.each(element => element.removeAttribute(`data-${key}`));
                return this;
            },
            attr (key,value) {
                if(key !== undefined) {
                    if (typeof key === 'string' && value !== undefined) {
                        key = {key, value};
                        value = undefined;
                    }
                    if (typeof key === 'string' && value === undefined) {
                        return this.first().getAttribute(key);
                    } else if(typeof key === 'object' && value === undefined) {
                        this.each(element => {
                            for (let i in key) {
                                element.setAttribute(i, key[i]);
                            }
                        });
                    }
                }
                return this;
            },
            removeAttr (key) {
                this.each(element => element.removeAttribute(key));
                return this;
            },
            eq (index) {
                return index !== undefined ? ( (elements[index] !== undefined) ? wk(elements[index]) : null ) : this;
            },
            get (index) {
                return index === undefined ? elements : ( (elements[index] !== undefined) ? elements[index] : null );
            },
            try (callback) {
                try { callback() } catch (e) { console.error(e) }
            },
            ready (callback) {
                const rs = document.readyState;
                if (rs !== 'loading') {
                    try { callback() } catch (e) { console.error(e) }
                } else if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', () => {
                        try { callback() } catch (e) { console.error(e) }
                    });
                } else {
                    document.attachEvent('onreadystatechange', () => {
                        if (rs === 'complete') {
                            try { callback() } catch (e) { console.error(e) }
                        }
                    });
                }
                return this;
            },
            on ( evt, selector, handler = undefined) {
                this.each(element => {
                    element.addEventListener(evt, (event) => {
                        let callback = handler == undefined ? selector : handler;
                        if ( typeof selector === 'string' && event.target.matches(selector + ', ' + selector + ' *') ) {
                            callback.apply(event.target.closest(selector), [event]);
                        } else {
                            if (typeof this.selector === 'string' && event.target.matches(this.selector + ', ' + this.selector + ' *') ) {
                                callback.apply(event.target, [event]);
                            }
                        }
                    });
                });
                return this;
            },
            serialize () {
                return serialize(this.first());
            },
            serializeArray () {
                return serialize(this.first(), true);
            },
            timeWorkCode (callback, id = Symbol("id").toString()) {
                console.time(id);
                    callback();
                console.timeEnd(id);
            }
        }

    }
    window.wk = wk;
})();

const WK = wk();
