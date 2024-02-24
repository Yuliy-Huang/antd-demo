import React from 'react';
import {useState, useRef, useEffect} from 'react';
import {
    BellOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ArrowsAltOutlined,
    ShrinkOutlined,
    CaretRightOutlined,
    PauseOutlined
} from '@ant-design/icons';
import './App.css';
import {Button, Col, Row, message, Input, Table} from 'antd';
import {CSSTransition} from 'react-transition-group'
import 'animate.css'
import {
    getElevatorInfoApi,
    openDoorApi,
    closeDoorApi,
    startElevatorApi,
    stopElevatorApi,
    callElevatorInsideApi, callElevatorOutsideApi
} from './backendApi'


function App() {
    const [pushedButtons, setPushedButtons] = useState<number[]>([])
    const [inputValue, setInputValue] = useState(1)
    const [floorData, setFloorData] = useState<any[]>([])
    const [currentFloor, setCurrentFloor] = useState(1)
    const [isUp, setIsUp] = useState(1)
    const [peopleCount, setPeopleCount] = useState(0)
    const [personData, setPersonData] = useState<any[]>([])
    const [doorOpenStatus, setDoorOpenStatus] = useState(0)
    const [doorCloseStatus, setDoorCloseStatus] = useState(0)
    const [show, setShow] = useState(true)

    const getElevatorInfoFunc = () => {
        setShow(false)
        getElevatorInfoApi({}).then((res) => {
            if (res.data.msg === 'success') {
                const data = res.data.data
                setCurrentFloor(data.current_floor)
                setIsUp(data.is_up)
                setPeopleCount(data.persons)
                setPersonData(data.person_data)
                setFloorData(data.building_floor_data)

                let newArray:any = []
                data.person_data.forEach((item: any) => {
                    if (pushedButtons.indexOf(item.target_floor) === -1) {
                        newArray.push(item.target_floor)
                    }
                })
                setPushedButtons(newArray)

                if (data.person_data.length === 0 && data.building_floor_data.length === 0) {
                    clearInterval(intervalHandle.current);
                }
             } else {
                message.error('Elevator did`t start yet');
            }
        }).finally(() => {
            setShow(true)
        })
    }


    const floorDataCol = [
        {
            title: 'Current',
            dataIndex: 'current_floor',
            key: 'current_floor',
        },
        {
            title: 'Target',
            dataIndex: 'target_floor',
            key: 'target_floor',
        },
        {
            title: 'Is Up',
            dataIndex: 'is_up',
            key: 'is_up',
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            key: 'weight',
        },
    ];

    let arrow;
    if (isUp) {
        arrow = <ArrowUpOutlined style={{color: '#c4fa14', marginRight: '95px'}}/>
    } else {
        arrow = <ArrowDownOutlined style={{color: '#c4fa14', marginRight: '95px'}}/>
    }

    const emergency = () => {
        message.warning('Have an emergency!');
    }

    const targetGo = (target_floor: number) => {
        setPushedButtons([...pushedButtons, target_floor])
        callElevatorInsideApi({current_floor: currentFloor, target_floor: target_floor}).then((res) => {
            const data = res.data.data
            setPeopleCount(data.persons)
            setPersonData(data.person_data)
            setFloorData(data.building_floor_data)
        })
    }

    const callElevatorFromOutside = (is_up: number) => {
        callElevatorOutsideApi({current_floor: inputValue, is_up: is_up}).then((res) => {
            const data = res.data.data
            setFloorData(data.building_floor_data)
        })
    }

    const deleteButtonFromPushed = (floor: number) => {
        let newArray = [...pushedButtons]
        const idx = newArray.indexOf(floor)
        if (idx !== -1) {
            newArray.splice(idx, 1);
        }
        setPushedButtons(newArray)
    }

    const openDoor = () => {
        setDoorOpenStatus(1)
        message.warning('Door is opening, currentFloor : ' + currentFloor.toString());
        openDoorApi({}).then(() => {
            deleteButtonFromPushed(currentFloor)
            message.success('Door is opened');
            setDoorOpenStatus(0)
        })
    }

    const closeDoor = () => {
        setDoorCloseStatus(1)
        message.warning('Door is closing');
        closeDoorApi({}).then(() => {
            message.success('Door is closed');
            setDoorCloseStatus(0)
        })
    }

    const buttons = [];
    for (let i = 10; i >= 0; i -= 2) {
        if (i === 0) {
            buttons.push(<div key={i}>
                <Button onClick={() => targetGo(i - 1)}
                        className={pushedButtons.indexOf(i - 1) === -1 ? 'left-button' : 'left-button-hover'}>{i - 1}</Button>
                <Button onClick={() => emergency()} className='right-button' type='primary'
                        danger><BellOutlined/></Button>
            </div>)
        } else {
            buttons.push(<div key={i}>
                <Button onClick={() => targetGo(i - 1)}
                        className={pushedButtons.indexOf(i - 1) === -1 ? 'left-button' : 'left-button-hover'}>{i - 1}</Button>
                <Button onClick={() => targetGo(i)}
                        className={pushedButtons.indexOf(i) === -1 ? 'right-button' : 'right-button-hover'}>{i}</Button>
            </div>)
        }
    }

    function isNumber(v: any) {
        return typeof v === 'number' && !isNaN(v);
    }

    const handleChange = (value: string) => {
        if (!isNumber(parseInt(value))) {
            message.error('Input value is not number');
            return false
        } else {
            if (parseInt(value) === 0) {
                message.error('No floor 0');
                return false
            } else if (parseInt(value) >= -1 && parseInt(value) <= 20) {
                setInputValue(parseInt(value))
            } else {
                message.error('Input value should be less than 20 and larger than -1');
                return false
            }
        }

    }

    let intervalHandle = useRef();

    const startElevatorFunc = () => {
        startElevatorApi({}).then(res => {
            message.success(res.data.msg);
            const data = res.data.data
            setCurrentFloor(data.current_floor)
            setIsUp(data.is_up)
            setPeopleCount(data.persons)
            setPersonData(data.person_data)
            setFloorData(data.building_floor_data)
        })
        // @ts-ignore
        intervalHandle.current = setInterval(getElevatorInfoFunc, 8000);
    }

    const stopElevatorFunc = () => {
        stopElevatorApi({}).then(res => {
            message.success(res.data.msg);
            const data = res.data.data
            setCurrentFloor(data.current_floor)
            setIsUp(data.is_up)
            setPeopleCount(data.persons)
            setPersonData(data.person_data)
            setFloorData(data.building_floor_data)
            setPushedButtons([])
        })
        clearInterval(intervalHandle.current);
    }

    useEffect(() => {
        return () => {
            clearInterval(intervalHandle.current);
        };
    }, [])

    const floorColor = (record: any) => {
        return record.current_floor === currentFloor && record.is_up === isUp? 'special-row' : ''
    }
    const personColor = (record: any) => {
        return record.target_floor === currentFloor? 'special-row' : ''
    }

    return (
        <div className="App">
            <Row>
                <Col span={6} offset={1} className="flow-col">
                    <div className="outside-elevator">
                        <div style={{marginBottom: '20px'}}>*Floor Data*</div>
                        <div>
                            <Table dataSource={floorData} columns={floorDataCol} rowClassName={floorColor}/>
                        </div>
                    </div>
                </Col>
                <Col span={4} offset={1}>
                    <div className="outside-elevator">
                        <div>*Outside the elevator*</div>
                        <div className="one-button" style={{marginBottom: '50px'}}>
                            <Button onClick={() => startElevatorFunc()} className='up-button'
                                    style={{
                                        backgroundColor: '#ff7875',
                                        marginTop: '8px',
                                        marginRight: '30px'
                                    }}><CaretRightOutlined/></Button>
                            <Button onClick={() => stopElevatorFunc()} className='up-button'
                                    style={{backgroundColor: '#ff7875', marginTop: '8px'}}><PauseOutlined/></Button>
                        </div>
                        <div className="one-button">
                            <Input size="large" value={inputValue} onChange={(e) => handleChange(e.target.value)}
                                   className="input-num"/>
                        </div>
                        <div className="one-button">
                            <Button onClick={() => callElevatorFromOutside(1)} className='up-button'
                                    style={{backgroundColor: '#bfbfbf', marginTop: '8px'}}><ArrowUpOutlined/></Button>
                        </div>
                        <div className="one-button">
                            <Button onClick={() => callElevatorFromOutside(0)} className='down-button'
                                    style={{backgroundColor: '#bfbfbf', marginTop: '8px'}}><ArrowDownOutlined/></Button>
                        </div>
                    </div>
                </Col>
                <Col span={3} offset={1}>
                    <div className="elevator">
                        <div className="title">
                            <div className="current-floor">
                                <CSSTransition
                                    in={show}
                                    classNames="box"
                                    timeout={1000}
                                    unmountOnExit
                                    appear>
                                    <span>{currentFloor}</span>
                                </CSSTransition>
                            </div>
                            <div style={{display: "inline-block"}}>{arrow}</div>
                        </div>
                        {buttons}
                        <div>
                            <Button onClick={() => openDoor()}
                                    className={doorOpenStatus === 1 ? 'left-button-hover' : 'left-button'}
                                    style={{backgroundColor: '#fffb8f', marginTop: '8px'}}><ArrowsAltOutlined
                                className="rotate"/></Button>
                            <Button onClick={() => closeDoor()}
                                    className={doorCloseStatus === 1 ? 'right-button-hover' : 'right-button'}
                                    style={{backgroundColor: '#fffb8f', marginTop: '8px'}}><ShrinkOutlined
                                className="rotate"/></Button>
                        </div>
                    </div>
                </Col>
                <Col span={6} offset={1}>
                    <div className="outside-elevator">
                        <div style={{marginBottom: '20px'}}>*Elevator Status*</div>
                        <div className="one-line">
                            <span>People Inside :&nbsp;&nbsp;{peopleCount}</span>
                        </div>
                        <div className="one-line">
                            <span>Data of people</span>
                        </div>
                        <div style={{marginTop: '30px'}}>
                            <Table dataSource={personData} columns={floorDataCol} rowClassName={personColor}/>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default App;
