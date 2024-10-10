import {useState} from "react";
import {observer} from "mobx-react-lite";
import {CSSTransition, SwitchTransition} from "react-transition-group";
import {formatTimestamp} from "@/utils/timeTools";
import {Refresh} from "@icon-park/react";
import {message} from "antd";
import CountUp from "react-countup";
import useStores from "@/hooks/useStores";


const translations = {
    loadingStatus: "Loading site status", // 站点状态加载中
    partialOutage: "Partial outage", // 部分站点出现异常
    majorOutage: "Major outage", // 全部站点出现异常
    allOperational: "All systems operational", // 所有站点运行正常
    requestFailed: "Data request failed", // 数据请求失败
    tryAgainLater: "Please try again later", // 请稍后再试
    loadingData: "Data is loading...", // 数据加载中...
    temporaryIssue: "This may be a temporary issue, please refresh and try again", // 这可能是临时性问题，请刷新后重试
    lastUpdateAt: "last update at", // 最后更新时间
    updateFrequency: "Update frequency: 5 minutes", // 更新频率 5 分钟
    totalSites: "Total sites", // 站点总数
    normalStatus: "Normal", // 正常
    abnormalStatus: "Abnormal", // 异常
    unknownStatus: "Unknown", // 未知
};

const Header = observer(({getSiteData}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const {status, cache} = useStores();
    const [lastClickTime, setLastClickTime] = useState(0);

    // 加载配置
    const siteName = import.meta.env.VITE_SITE_NAME;

    // 状态文本
    const statusNames = {
        loading: translations.loadingStatus, // 站点状态加载中
        error: translations.partialOutage, // 部分站点出现异常
        allError: translations.majorOutage, // 全部站点出现异常
        normal: translations.allOperational, // 所有站点运行正常
        wrong: translations.requestFailed, // 数据请求失败
    };

    // 刷新状态
    const refreshStatus = () => {
        const currentTime = Date.now();
        if (currentTime - lastClickTime < 60000) {
            messageApi.open({
                key: "updata",
                type: "warning",
                content: translations.tryAgainLater, // 请稍后再试
            });
            return false;
        }
        cache.changeSiteData(null);
        getSiteData();
        setLastClickTime(currentTime);
    };

    return (
        <header id="header" className={status.siteState}>
            {contextHolder}
            <SwitchTransition mode="out-in">
                <CSSTransition key={status.siteState} classNames="fade" timeout={300}>
                    <div className={`cover ${status.siteState}`}/>
                </CSSTransition>
            </SwitchTransition>
            <div className="container">
                <div className="menu">
                    <a href={import.meta.env.VITE_HOME_URL} target="_blank" rel="noreferrer">
                        <span className="logo">{siteName}</span>
                    </a>
                </div>
                <div className="status">
                    <div className={`icon ${status.siteState}`}/>
                    <div className="r-text">
                        <SwitchTransition mode="out-in">
                            <CSSTransition
                                key={status.siteState}
                                classNames="fade"
                                timeout={300}
                            >
                                <div className="text">{statusNames[status.siteState]}</div>
                            </CSSTransition>
                        </SwitchTransition>
                        <div className="tip">
                            <SwitchTransition mode="out-in">
                                <CSSTransition
                                    key={status.siteState}
                                    classNames="fade"
                                    timeout={300}
                                >
                                    {status.siteState === "loading" ? (
                                        <span>{translations.loadingData}</span> // 数据加载中...
                                    ) : status.siteState === "wrong" ? (
                                        <span>{translations.temporaryIssue}</span> // 这可能是临时性问题，请刷新后重试
                                    ) : (
                                        <div className="time">
                      <span className="last-update">
                        {`${translations.lastUpdateAt} ${
                            formatTimestamp(cache.siteData?.timestamp).justTime
                        }`}
                      </span>
                                            <div className="update">
                                                <span>{translations.updateFrequency}</span>
                                                <Refresh className="refresh" onClick={refreshStatus}/>
                                            </div>
                                        </div>
                                    )}
                                </CSSTransition>
                            </SwitchTransition>
                        </div>
                    </div>
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            key={status.siteOverview}
                            classNames="fade"
                            timeout={300}
                        >
                            {status.siteOverview ? (
                                <div className="overview">
                                    <div className="count">
                                        {/*站点总数*/}
                                        <span className="name">{translations.totalSites}</span>
                                        <CountUp
                                            className="num"
                                            end={status.siteOverview.count}
                                            duration={1}
                                        />
                                    </div>
                                    <div className="status-num">
                                        <div className="ok-count">
                                            {/*正常*/}
                                            <span className="name">{translations.normalStatus}</span>
                                            <CountUp
                                                className="num"
                                                end={status.siteOverview.okCount}
                                                duration={1}
                                            />
                                        </div>
                                        <div className="down-count">
                                            {/*异常*/}
                                            <span className="name">{translations.abnormalStatus}</span>
                                            <span className="num">
                        <CountUp
                            className="num"
                            end={status.siteOverview.downCount}
                            duration={1}
                        />
                      </span>
                                        </div>
                                        {status.siteOverview?.unknownCount ? (
                                            <div className="unknownCount-count">
                                                {/*未知*/}
                                                <span className="name">{translations.unknownStatus}</span>
                                                <span className="num">
                          <CountUp
                              className="num"
                              end={status.siteOverview.unknownCount}
                              duration={1}
                          />
                        </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ) : (
                                <div className="overview"/>
                            )}
                        </CSSTransition>
                    </SwitchTransition>
                </div>
            </div>
        </header>
    );
});

export default Header;

