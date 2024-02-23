import React from 'react';
import {useState} from 'react';
import {BellOutlined, ArrowUpOutlined, ArrowDownOutlined, ArrowsAltOutlined, ShrinkOutlined} from '@ant-design/icons';
import './App.css';
import {Button} from 'antd';
import {Col, Row, message, Input} from 'antd';


function App() {
    const [pushedButtons, setPushButtons] = useState<number[]>([])
    const [inputValue, setInputValue] = useState(1)
    const [floorData, setFloorData] = useState<any[]>([])
    const [currentFloor, setCurrentFloor] = useState(1)
    const [isUp, setIsUp] = useState(1)
    const [peopleCount, setPeopleCount] = useState(1)
    const [personData, setPersonData] = useState<any[]>([])

    let arrow;
    if (isUp) {
        arrow = <ArrowUpOutlined style={{color: '#fadb14', marginRight: '95px'}}/>
    } else {
        arrow = <ArrowDownOutlined style={{color: '#fadb14', marginRight: '95px'}}/>
    }

    const emergency = () => {
        message.warning('Have an emergency!');
    }

    const targetGo = (target_floor: number) => {
        setPushButtons([...pushedButtons, target_floor])
    }

    const openDoor = () => {
        message.warning('Door is opening');
        setPushButtons(
            pushedButtons.filter(a => a === currentFloor)
        );
    }

    const closeDoor = () => {
        message.warning('Door is closing');
    }

    const buttons = [];
    for (let i = 20; i >= 0; i -= 2) {
        if (i === 0) {
            buttons.push(<div key={i}>
                <Button onClick={() => targetGo(i - 1)} className={pushedButtons.indexOf(i - 1) === -1?'left-button': 'left-button-hover'} >{i - 1}</Button>
                <Button onClick={() => emergency()} className='right-button' type='primary'
                        danger><BellOutlined/></Button>
            </div>)
        } else {
            buttons.push(<div key={i}>
                <Button onClick={() => targetGo(i - 1)} className={pushedButtons.indexOf(i - 1) === -1?'left-button': 'left-button-hover'}>{i - 1}</Button>
                <Button onClick={() => targetGo(i)} className={pushedButtons.indexOf(i) === -1?'right-button': 'right-button-hover'}>{i}</Button>
            </div>)
        }
    }

    function isNumber(v:any) {
        return typeof v === 'number' && !isNaN(v);
    }

    const handleChange = (value: string) => {
        console.log('isNumber(value) : ', isNumber(parseInt(value)))
        if (!isNumber(parseInt(value))) {
            message.error('Input value is not number');
            return false
        } else {
            if (parseInt(value) === 0) {
                message.error('No floor 0');
                return false
            } else if (parseInt(value) >= -1 && parseInt(value) <=20) {
                setInputValue(parseInt(value))
            } else {
                message.error('Input value should be less than 20 and larger than -1');
                return false
            }
        }

    };

    const callElevator = (is_up: number) => {

    }


    return (
        <div className="App">
            <Row>
                <Col span={4} offset={1}>
                    <div className="outside-elevator">
                        <div style={{marginBottom: '50px'}}>Floor Data</div>
                        <div>
                            {floorData}
                        </div>
                    </div>
                </Col>
                <Col span={4} offset={2}>
                    <div className="outside-elevator">
                        <div style={{marginBottom: '50px'}}>Outside the elevator</div>
                        <div>
                            <Input size="large" value={inputValue} onChange={(e) => handleChange(e.target.value)}
                                   className="input-num"/>
                        </div>
                        <div className="one-button">
                            <Button onClick={() => callElevator(1)} className='up-button'
                                    style={{backgroundColor: '#bfbfbf', marginTop: '8px'}}><ArrowUpOutlined/></Button>
                        </div>
                        <div className="one-button">
                            <Button onClick={() => callElevator(0)} className='down-button'
                                    style={{backgroundColor: '#bfbfbf', marginTop: '8px'}}><ArrowDownOutlined/></Button>
                        </div>
                    </div>
                </Col>
                <Col span={3} offset={1}>
                    <div className="elevator">
                        <div className="title">
                            <span className="current-floor">{currentFloor}</span>
                            {arrow}
                        </div>
                        {buttons}
                        <div>
                            <Button onClick={() => openDoor()} className='left-button'
                                    style={{backgroundColor: '#fffb8f', marginTop: '8px'}}><ArrowsAltOutlined
                                className="rotate"/></Button>
                            <Button onClick={() => closeDoor()} className='right-button'
                                    style={{backgroundColor: '#fffb8f', marginTop: '8px'}}><ShrinkOutlined
                                className="rotate"/></Button>
                        </div>
                    </div>
                </Col>
                <Col span={4} offset={2}>
                    <div className="outside-elevator">
                        <div style={{marginBottom: '50px'}}>Elevator Status</div>
                        <div className="one-line">
                            People counting :&nbsp;&nbsp;{peopleCount}
                        </div>
                        <div className="one-line">
                            Data of persons :
                        </div>
                        <div className="one-line">
                            {personData}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default App;
